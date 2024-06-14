const fetchTestRecommendations = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found');
      return;
    }
  
    try {
      const response = await fetch('/recommendations', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log('Fetched data:', data);
      if (data && Array.isArray(data.response.jobs)) {
        setTestRecommendations(data.response.jobs);
      } else {
        console.error('Invalid data format:', data);
        setTestRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching test recommendations:', error);
  
      // Mock data fallback
      const mockData = [
        {
          title: 'Software Engineer II, Full Stack, Geo at Google',
          companyName: 'Google',
          location: 'Bengaluru, Karnataka, India',
          description: "Minimum qualifications: Bachelor's degree or equivalent practical experience. 1 year of experience with software development.",
          applyUrl: 'https://careers.google.com/jobs/results/108699149884367558-software-engineer-ii/'
        },
        {
          title: 'Student Researcher, 2024 at Google',
          companyName: 'Google',
          location: 'Munich, Bavaria, Germany',
          description: 'Placeholder job description to be used only by the Campus team. Please complete your application before June 21, 2024.',
          applyUrl: 'https://careers.google.com/jobs/results/102147380345742022-student-researcher/'
        }
      ];
      setTestRecommendations(mockData);
    }
  };
  