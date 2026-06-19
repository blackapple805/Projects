const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const store = require('./store'); // file-based datastore (replaces MySQL)
const SAMPLE_JOBS = require('./sampleJobs'); // built-in job listings (no external API)

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ----- Config (use environment variables in production) -----
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key';

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Profile picture upload (images)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});
const upload = multer({ storage });

// Resume upload (pdf / doc / docx, max 5MB)
const resumeStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, 'resume-' + Date.now() + '-' + file.originalname),
});
const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) return cb(null, true);
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  },
});

// Pick only the public-facing profile fields to send to the client.
function publicProfile(user) {
  const {
    name, email, phone, address, profile_picture, bio,
    desired_position, preferred_location, experience_level,
    preferred_companies, resume_path, resume_name,
  } = user;
  return {
    name, email, phone, address, profile_picture, bio,
    desired_position, preferred_location, experience_level,
    preferred_companies, resume_path, resume_name,
  };
}

// Auth middleware. With login disabled, a missing/invalid token simply falls
// back to a shared "guest" user so every feature keeps working without a token.
// (Re-enable real auth later by restoring the 401 responses below.)
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token) {
    try {
      const decoded = jwt.verify(token.split(' ')[1], JWT_SECRET);
      req.userId = decoded.id;
      return next();
    } catch (e) {
      // Invalid token — fall through to guest instead of rejecting.
    }
  }
  const guest = store.getOrCreateGuest();
  req.userId = guest.id;
  next();
};

app.get('/', (req, res) => res.send('Job Recommendation System API'));

// ----- Signup -----
app.post('/signup', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).send({ message: 'Email and password are required' });
  if (store.findByEmail(email)) return res.status(400).send({ message: 'User already exists' });
  const hashedPassword = bcrypt.hashSync(password, 10);
  store.create({ email, password: hashedPassword });
  res.status(201).send({ message: 'User created successfully' });
});

// ----- Login -----
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = store.findByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).send({ message: 'Authentication failed' });
  }
  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1h' });
  res.status(200).send({ token, userId: user.id });
});

// ----- Job recommendations (from built-in sample data, no external API) -----
// Filters the sample jobs by the user's desired position and location so the
// results still feel personalized. No API key, no quota, no network errors.
// Build a REAL apply link for a given provider, pre-filled with the job's
// title + company so it lands on an actual filtered search rather than a
// generic homepage. Works for any job without hardcoding URLs.
function buildApplyUrl(provider, job) {
  const kw = encodeURIComponent(`${job.title} ${job.company}`);
  const kwTitle = encodeURIComponent(job.title);
  const loc = encodeURIComponent(job.location || '');
  switch ((provider || '').toLowerCase()) {
    case 'linkedin':
      return `https://www.linkedin.com/jobs/search/?keywords=${kw}&location=${loc}`;
    case 'indeed':
      return `https://www.indeed.com/jobs?q=${kw}&l=${loc}`;
    case 'greenhouse':
      return `https://boards.greenhouse.io/embed/job_board?for=${encodeURIComponent(job.company)}`;
    case 'lever':
      return `https://jobs.lever.co/?query=${kwTitle}`;
    case 'angellist':
    case 'wellfound':
      return `https://wellfound.com/role/r/${kwTitle}`;
    case 'glassdoor':
      return `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${kw}`;
    default:
      // Fallback: Google Jobs search, always resolves to real listings.
      return `https://www.google.com/search?q=${kw}+${encodeURIComponent('job')}`;
  }
}

// Simple Fisher–Yates shuffle so Refresh surfaces a fresh ordering each call.
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

app.get('/recommendations', verifyToken, (req, res) => {
  const user = store.findById(req.userId);
  if (!user) return res.status(404).send({ message: 'User not found' });

  const query = (req.query.query || user.desired_position || '').toLowerCase().trim();
  const location = (req.query.location || user.preferred_location || '').toLowerCase().trim();

  // Score each job: matches on title/tags and location rank higher.
  const scored = SAMPLE_JOBS.map(job => {
    let score = 0;
    const haystack = `${job.title} ${(job.tags || []).join(' ')}`.toLowerCase();

    if (query) {
      query.split(/\s+/).forEach(word => {
        if (word.length > 2 && haystack.includes(word)) score += 3;
      });
    }
    if (location) {
      const jobLoc = (job.location || '').toLowerCase();
      if (jobLoc.includes(location) || (location.includes('remote') && jobLoc.includes('remote'))) {
        score += 2;
      }
    }
    // Small random tiebreaker so equal-scoring jobs reorder between refreshes.
    return { job, score, rnd: Math.random() };
  });

  const anyMatch = scored.some(s => s.score > 0);

  let ordered;
  if (anyMatch) {
    // Keep relevant jobs first, but shuffle within the same score band so a
    // Refresh still varies the order of equally-good matches.
    ordered = scored
      .filter(s => s.score > 0)
      .sort((a, b) => (b.score - a.score) || (a.rnd - b.rnd));
  } else {
    // No preferences set (e.g. Guest): fully shuffle so every Refresh is new.
    ordered = shuffle(scored);
  }

  const result = ordered.map(s => {
    const job = s.job;
    // Regenerate provider links as real, pre-filled searches.
    const jobProviders = (job.jobProviders || []).map(p => ({
      jobProvider: p.jobProvider,
      url: buildApplyUrl(p.jobProvider, job),
    }));
    return {
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description && job.description.length > 150
        ? job.description.substring(0, 150) + '...'
        : job.description,
      datePosted: job.datePosted,
      employmentType: job.employmentType,
      image: job.image,
      jobProviders,
    };
  });

  res.status(200).send(result);
});

// ----- Get user profile -----
app.get('/profile', verifyToken, (req, res) => {
  const user = store.findById(req.userId);
  if (!user) return res.status(404).send({ message: 'User not found' });
  res.status(200).send(publicProfile(user));
});

// Alias kept for the dashboard's /user-data call
app.get('/user-data', verifyToken, (req, res) => {
  const user = store.findById(req.userId);
  if (!user) return res.status(404).send({ message: 'User not found' });
  res.status(200).send(publicProfile(user));
});

// ----- Update profile -----
app.put('/profile', verifyToken, (req, res) => {
  const { name, phone, address } = req.body;
  const updated = store.update(req.userId, { name, phone, address });
  if (!updated) return res.status(404).send({ message: 'User not found' });
  res.status(200).send({ message: 'Profile updated successfully' });
});

// ----- Update profile picture -----
app.put('/profile-picture', verifyToken, upload.single('profile_picture'), (req, res) => {
  const user = store.findById(req.userId);
  if (!user) return res.status(404).send({ message: 'User not found' });
  const oldPic = user.profile_picture;
  const profilePicture = req.file.path;
  store.update(req.userId, { profile_picture: profilePicture });
  if (oldPic) fs.unlink(oldPic, () => {});
  res.status(200).send({ message: 'Profile picture updated successfully', profilePicture });
});

// ----- Resume upload + lightweight parsing to seed the job search -----
app.put('/resume', verifyToken, resumeUpload.single('resume'), async (req, res) => {
  if (!req.file) return res.status(400).send({ message: 'No resume file provided' });
  const user = store.findById(req.userId);
  if (!user) return res.status(404).send({ message: 'User not found' });

  const resumePath = req.file.path;
  const resumeName = req.file.originalname;
  const oldResume = user.resume_path;

  let detected = { desired_position: null, preferred_location: null };
  try {
    detected = await parseResume(resumePath);
  } catch (e) {
    console.warn('Resume parsing skipped:', e.message);
  }

  // Only fill a preference from the resume if the user hasn't set it already.
  const fields = { resume_path: resumePath, resume_name: resumeName };
  if (detected.desired_position && !user.desired_position) fields.desired_position = detected.desired_position;
  if (detected.preferred_location && !user.preferred_location) fields.preferred_location = detected.preferred_location;

  store.update(req.userId, fields);
  if (oldResume && oldResume !== resumePath) fs.unlink(oldResume, () => {});

  res.status(200).send({ message: 'Resume uploaded successfully', resumePath, resumeName, detected });
});

// Helper: extract text from a resume and guess a job title / location.
async function parseResume(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  let text = '';

  if (ext === '.pdf') {
    const pdfParse = require('pdf-parse');
    text = (await pdfParse(fs.readFileSync(filePath))).text || '';
  } else if (ext === '.docx') {
    const mammoth = require('mammoth');
    text = (await mammoth.extractRawText({ path: filePath })).value || '';
  } else {
    text = fs.readFileSync(filePath, 'utf8');
  }

  const titles = [
    'Software Engineer', 'Frontend Developer', 'Front End Developer', 'Backend Developer',
    'Full Stack Developer', 'Web Developer', 'Data Scientist', 'Data Analyst',
    'Product Manager', 'UX Designer', 'UI Designer', 'DevOps Engineer',
    'Machine Learning Engineer', 'Mobile Developer', 'QA Engineer', 'Project Manager',
  ];
  let desired_position = null;
  for (const t of titles) {
    if (new RegExp(t, 'i').test(text)) { desired_position = t; break; }
  }

  let preferred_location = null;
  const locMatch = text.match(/([A-Z][a-zA-Z\s]+,\s*[A-Z]{2})\b/);
  if (locMatch) preferred_location = locMatch[1].trim();

  return { desired_position, preferred_location };
}

// ----- Update password -----
app.put('/update-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = store.findById(req.userId);
  if (!user) return res.status(404).send({ message: 'User not found' });
  if (!bcrypt.compareSync(currentPassword, user.password)) {
    return res.status(401).send({ message: 'Current password is incorrect' });
  }
  store.update(req.userId, { password: bcrypt.hashSync(newPassword, 10) });
  res.status(200).send({ message: 'Password updated successfully' });
});

// ----- User preferences -----
app.put('/user-preferences', verifyToken, (req, res) => {
  const { bio, desired_position, preferred_location, experience_level, preferred_companies } = req.body;
  const updated = store.update(req.userId, {
    bio, desired_position, preferred_location, experience_level, preferred_companies,
  });
  if (!updated) return res.status(404).send({ message: 'User not found' });
  res.status(200).send({ message: 'User preferences updated successfully' });
});

app.get('/user-preferences', verifyToken, (req, res) => {
  const user = store.findById(req.userId);
  if (!user) return res.status(404).send({ message: 'User preferences not found' });
  const { bio, desired_position, preferred_location, experience_level, preferred_companies, resume_name } = user;
  res.status(200).send({ bio, desired_position, preferred_location, experience_level, preferred_companies, resume_name });
});

// ----- Billing -----
app.post('/billing', verifyToken, (req, res) => {
  const { card_holder_name, card_number, expiry_date, cvv } = req.body;
  const updated = store.update(req.userId, { card_holder_name, card_number, expiry_date, cvv });
  if (!updated) return res.status(404).send('User not found');
  res.send('Billing details saved successfully');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
