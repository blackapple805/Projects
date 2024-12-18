import React, { useState } from 'react';
import Spline from '@splinetool/react-spline'; 
import './Home.css'; 
import heroImage1 from '../assets/hero-image-1.jpg';
import heroImage2 from '../assets/hero-image-2.jpg';
import heroImage3 from '../assets/hero-image-3.jpg';
import franceFlag from '../assets/france.png'; 
import { AiOutlineHeart } from 'react-icons/ai';
import { AiOutlineClose } from 'react-icons/ai';

export default function Home() {
  const products = [
    { img: heroImage1, name: "Neverfull Inside Out MM Bag", price: "2 500,00€" },
    { img: heroImage2, name: "Métis Pouch", price: "2 300,00€" },
    { img: heroImage3, name: "Alma BB bag", price: "1 550,00€" },
  ];

  const handleLoad = (splineApp) => {
    console.log('Spline loaded:', splineApp);
  };

  // Accordion states for mobile
  const [openSections, setOpenSections] = useState({
    help: false,
    services: false,
    about: false,
    follow: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // State for the contact sidebar
  const [showContactSidebar, setShowContactSidebar] = useState(false);

  const handleContactClick = (e) => {
    e.preventDefault();
    setShowContactSidebar(true);
  };

  const handleCloseSidebar = () => {
    setShowContactSidebar(false);
  };

  return (
    <>
      {/* 3D Scene */}
      <div className="w-full flex items-center justify-center">
        <div style={{ width: '1200px', maxWidth: '90%', margin: '0 auto' }}>
          <Spline 
            scene="https://prod.spline.design/YGBzxvHdXPfVSOMZ/scene.splinecode"
            onLoad={handleLoad}
          />
        </div>
      </div>

      <div className="home-container text-black relative font-normal">
        {/* Top Section */}
        <div className="text-center mb-8 mt-8">
          <span className="block uppercase tracking-wide text-sm text-gray-700 mb-2 font-normal">
            MAN
          </span>
          <h1 className="home-heading text-2xl md:text-3xl font-normal mb-4">
            Bags for Men
          </h1>
        </div>

        {/* Products */}
        <div className="flex space-x-8 overflow-x-auto snap-x snap-mandatory scrollbar-none px-4 py-2 items-start">
          {products.map((product, index) => (
            <div key={index} className="relative flex-shrink-0 snap-start">
              <div className="relative group overflow-hidden rounded-lg">
                <img 
                  src={product.img}
                  alt={product.name}
                  className="h-auto w-[300px] object-cover transition-transform duration-300 hover:scale-105 hover:shadow-md rounded-lg" 
                />
                <AiOutlineHeart 
                  size={24} 
                  className="absolute top-2 right-2 text-black hover:text-gray-700 transition-colors font-normal"
                />
              </div>
              <div className="mt-2 text-left">
                <p className="text-black font-normal text-sm">{product.name}</p>
                <p className="text-gray-700 font-normal text-sm">{product.price}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Button */}
        <div className="text-center mt-8">
          <button className="selection-button font-normal text-sm">
            Discover the Selection
          </button>
        </div>

        {/* Services Section */}
        <div className="mt-8 text-center px-4 font-normal">
          <h2 className="home-heading text-2xl md:text-3xl font-normal mb-2">
            TINA SHAYESTE Services
          </h2>
          <p className="text-sm text-gray-700 max-w-md mx-auto mb-4 font-normal">
            Tina Shayeste offers personalized packaging and exclusive experiences for every order,
            presented in the House's distinctive style.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <img 
                src={heroImage1}
                alt="Service 1"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            <div>
              <img 
                src={heroImage2}
                alt="Service 2"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
            <div>
              <img 
                src={heroImage3}
                alt="Service 3"
                className="w-full h-auto object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Bottom Links Section */}
        <div className="mt-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center items-baseline font-normal">
            {/* Column 1 */}
            <div>
              <h3 className="home-heading text-xl font-normal mb-2">Services</h3>
              <a 
                href="/contact" 
                className="inline-block text-sm text-black hover:text-gray-500 font-normal underline-link"
                onClick={handleContactClick}
              >
                Contact us
              </a>
            </div>
            
            {/* Column 2 */}
            <div>
              <h3 className="home-heading text-xl font-normal mb-2">The Art of Giving</h3>
              <div>
                <a 
                  href="/for-her"
                  className="inline-block text-sm text-black hover:text-gray-500 mx-2 font-normal underline-link"
                >
                  For Her
                </a>
                <a 
                  href="/for-him"
                  className="inline-block text-sm text-black hover:text-gray-500 mx-2 font-normal underline-link"
                >
                  For Him
                </a>
              </div>
            </div>
            
            {/* Column 3 */}
            <div>
              <h3 className="home-heading text-xl font-normal mb-2">Personalization</h3>
              <a 
                href="/explore" 
                className="inline-block text-sm text-black hover:text-gray-500 font-normal underline-link"
              >
                Explore
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Top Grey Line */}
      <hr className="border-t border-gray-300 my-6 w-full" />

      {/* Mobile Accordions with Brand Title */}
      <div className="md:hidden w-full px-4 font-normal space-y-4">
        <div className="text-center mb-2">
          <h2 className="font-display text-xl font-normal">TINA SHAYESTE</h2>
        </div>

        {/* HELP Accordion */}
        <div>
          <button 
            onClick={() => toggleSection('help')} 
            className="w-full flex justify-between items-center py-2 text-left border-b border-gray-300"
          >
            <span className="uppercase text-xs text-black tracking-wide font-normal">Help</span>
            <span className="text-black font-normal text-lg">
              {openSections.help ? '-' : '+'}
            </span>
          </button>
          {openSections.help && (
            <div className="pt-2">
              <p className="text-sm text-black mb-4 font-normal">
                Need gift inspiration? Customer service is available 7 days a week 
                at <a href="tel:+33977404077" className="underline-link hover:text-gray-500 font-normal">+33 9 77 40 40 77</a>, 
                by <a href="/whatsapp" className="hover:text-gray-500 font-normal">WhatsApp</a> or by <a href="/email" className="hover:text-gray-500 font-normal">email</a>.
              </p>
              <ul className="space-y-2 text-sm text-black font-normal">
                <li><a href="/faq" className="hover:text-gray-500 font-normal">FAQ</a></li>
                <li><a href="/care-instructions" className="hover:text-gray-500 font-normal">Care instructions</a></li>
                <li><a href="/environmental" className="hover:text-gray-500 font-normal">Environmental characteristics</a></li>
                <li><a href="/find-store" className="hover:text-gray-500 font-normal">Find a store or restaurant</a></li>
                <li><a href="/appointment" className="hover:text-gray-500 font-normal">Make an appointment in store</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* SERVICES Accordion */}
        <div>
          <button 
            onClick={() => toggleSection('services')} 
            className="w-full flex justify-between items-center py-2 text-left border-b border-gray-300"
          >
            <span className="uppercase text-xs text-black tracking-wide font-normal">Services</span>
            <span className="text-black font-normal text-lg">
              {openSections.services ? '-' : '+'}
            </span>
          </button>
          {openSections.services && (
            <div className="pt-2">
              <ul className="space-y-2 text-sm text-black font-normal">
                <li><a href="/repairs" className="hover:text-gray-500 font-normal">Repairs</a></li>
                <li><a href="/personalization" className="hover:text-gray-500 font-normal">Personalization</a></li>
                <li><a href="/art-of-giving" className="hover:text-gray-500 font-normal">The Art of Giving</a></li>
                <li><a href="/apps" className="hover:text-gray-500 font-normal">Download our apps</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* ABOUT TINA SHAYESTE Accordion */}
        <div>
          <button 
            onClick={() => toggleSection('about')} 
            className="w-full flex justify-between items-center py-2 text-left border-b border-gray-300"
          >
            <span className="uppercase text-xs text-black tracking-wide font-normal">About Tina Shayeste</span>
            <span className="text-black font-normal text-lg">
              {openSections.about ? '-' : '+'}
            </span>
          </button>
          {openSections.about && (
            <div className="pt-2">
              <ul className="space-y-2 text-sm text-black font-normal">
                <li><a href="/parades" className="hover:text-gray-500 font-normal">Parades</a></li>
                <li><a href="/arts-culture" className="hover:text-gray-500 font-normal">Arts & Culture</a></li>
                <li><a href="/the-house" className="hover:text-gray-500 font-normal">The House</a></li>
                <li><a href="/sustainable-development" className="hover:text-gray-500 font-normal">Sustainable Development</a></li>
                <li><a href="/whats-new" className="hover:text-gray-500 font-normal">What's new</a></li>
                <li><a href="/career" className="hover:text-gray-500 font-normal">Career</a></li>
                <li><a href="/foundation" className="hover:text-gray-500 font-normal">Tina Shayeste Foundation</a></li>
              </ul>
            </div>
          )}
        </div>

        {/* FOLLOW US Accordion */}
        <div>
          <button 
            onClick={() => toggleSection('follow')} 
            className="w-full flex justify-between items-center py-2 text-left border-b border-gray-300"
          >
            <span className="uppercase text-xs text-black tracking-wide font-normal">Follow Us</span>
            <span className="text-black font-normal text-lg">
              {openSections.follow ? '-' : '+'}
            </span>
          </button>
          {openSections.follow && (
            <div className="pt-2">
              <p className="text-sm text-black mb-4 font-normal">
                <a href="/newsletter" className="hover:text-gray-500 font-normal">Subscribe to the Newsletter</a> to receive exclusive updates, 
                exclusive online pre-launch events and new collections.
              </p>
              <ul className="space-y-2 text-sm text-black font-normal">
                <li><a href="/social" className="hover:text-gray-500 font-normal">Social networks</a></li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Desktop columns visible only on md+ */}
      <div className="hidden md:block w-full px-4 mb-8 font-normal">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8 text-black">
          {/* HELP Column */}
          <div>
            <h4 className="uppercase text-xs text-black tracking-wide mb-4 font-normal">HELP</h4>
            <p className="text-sm text-black mb-4 font-normal">
              Need gift inspiration? Customer service is available 7 days a week 
              at <a href="tel:+33977404077" className="underline-link hover:text-gray-500 font-normal">+33 9 77 40 40 77</a>, 
              by <a href="/whatsapp" className="hover:text-gray-500 font-normal">WhatsApp</a> or by <a href="/email" className="hover:text-gray-500 font-normal">email</a>.
            </p>
            <ul className="space-y-2 text-sm text-black font-normal">
              <li><a href="/faq" className="hover:text-gray-500 font-normal">FAQ</a></li>
              <li><a href="/care-instructions" className="hover:text-gray-500 font-normal">Care instructions</a></li>
              <li><a href="/environmental" className="hover:text-gray-500 font-normal">Environmental characteristics</a></li>
              <li><a href="/find-store" className="hover:text-gray-500 font-normal">Find a store or restaurant</a></li>
              <li><a href="/appointment" className="hover:text-gray-500 font-normal">Make an appointment in store</a></li>
            </ul>
          </div>

          {/* SERVICES Column */}
          <div>
            <h4 className="uppercase text-xs text-black tracking-wide mb-4 font-normal">SERVICES</h4>
            <ul className="space-y-2 text-sm text-black font-normal">
              <li><a href="/repairs" className="hover:text-gray-500 font-normal">Repairs</a></li>
              <li><a href="/personalization" className="hover:text-gray-500 font-normal">Personalization</a></li>
              <li><a href="/art-of-giving" className="hover:text-gray-500 font-normal">The Art of Giving</a></li>
              <li><a href="/apps" className="hover:text-gray-500 font-normal">Download our apps</a></li>
            </ul>
          </div>

          {/* ABOUT TINA SHAYESTE Column */}
          <div>
            <h4 className="uppercase text-xs text-black tracking-wide mb-4 font-normal">ABOUT TINA SHAYESTE</h4>
            <ul className="space-y-2 text-sm text-black font-normal">
              <li><a href="/parades" className="hover:text-gray-500 font-normal">Parades</a></li>
              <li><a href="/arts-culture" className="hover:text-gray-500 font-normal">Arts & Culture</a></li>
              <li><a href="/the-house" className="hover:text-gray-500 font-normal">The House</a></li>
              <li><a href="/sustainable-development" className="hover:text-gray-500 font-normal">Sustainable Development</a></li>
              <li><a href="/whats-new" className="hover:text-gray-500 font-normal">What's new</a></li>
              <li><a href="/career" className="hover:text-gray-500 font-normal">Career</a></li>
              <li><a href="/foundation" className="hover:text-gray-500 font-normal">Tina Shayeste Foundation</a></li>
            </ul>
          </div>

          {/* FOLLOW US Column */}
          <div>
            <h4 className="uppercase text-xs text-black tracking-wide mb-4 font-normal">FOLLOW US</h4>
            <p className="text-sm text-black mb-4 font-normal">
              <a href="/newsletter" className="hover:text-gray-500 font-normal">Subscribe to the Newsletter</a> to receive exclusive updates, 
              exclusive online pre-launch events and new collections.
            </p>
            <ul className="space-y-2 text-sm text-black font-normal">
              <li><a href="/social" className="hover:text-gray-500 font-normal">Social networks</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Grey Line */}
      <hr className="border-t border-gray-300 my-6 w-full" />

      {/* Final Footer Line */}
      <div className="relative w-full flex items-center justify-center text-sm text-black px-4 mb-4 font-normal">
        {/* Left Side: Country of Delivery */}
        <div className="absolute left-4 flex items-center space-x-2">
          <span>Country of delivery:</span>
          <img 
            src={franceFlag} 
            alt="France Flag" 
            className="h-4 w-6 object-cover inline-block"
          />
          <a 
            href="#"
            className="inline-block text-sm text-black hover:text-gray-500 font-normal underline-link"
          >
            France
          </a>
        </div>
        
        {/* Center: Brand Name */}
        <div className="footer-brand">
          TINA SHAYESTE
        </div>
        
        {/* Right Side: Links */}
        <div className="absolute right-4 space-x-4">
          <a href="/site-map" className="hover:text-gray-500">Site Map</a>
          <a href="/legal-notices" className="hover:text-gray-500">Legal notices</a>
          <a href="/cookies" className="hover:text-gray-500">Cookies</a>
        </div>
      </div>

      {/* Contact Sidebar */}
      {showContactSidebar && (
        <div className="fixed top-0 right-0 h-full w-full bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-[300px] sm:w-[400px] h-full relative p-4 overflow-auto">
            <button onClick={handleCloseSidebar} className="absolute top-4 right-4 hover:text-gray-500">
              <AiOutlineClose size={24} />
            </button>
            <h2 className="text-xl font-normal mb-4">Contact us</h2>
            <p className="text-sm text-black mb-4 font-normal">
              Need gift inspiration? Wherever you are, our customer advisors will be happy to help you.
            </p>
            <ul className="space-y-2 text-sm text-black font-normal mb-4">
              <li><a href="tel:+33977404077" className="underline-link hover:text-gray-500 font-normal">+33 9 77 40 40 77</a></li>
              <li><a href="/email" className="hover:text-gray-500 font-normal">Send an email</a></li>
              <li><a href="/whatsapp" className="hover:text-gray-500 font-normal">WhatsApp</a></li>
              <li><a href="/apple-message" className="hover:text-gray-500 font-normal">Apple Message</a></li>
              <li><a href="/deaf-hard-of-hearing" className="hover:text-gray-500 font-normal">Deaf and Hard of Hearing Customer Service</a></li>
            </ul>
            <h3 className="text-sm font-normal mb-2">Need help?</h3>
            <ul className="space-y-2 text-sm text-black font-normal">
              <li><a href="/your-questions" className="hover:text-gray-500 font-normal">Your questions</a></li>
              <li><a href="/repair-service" className="hover:text-gray-500 font-normal">Repair service</a></li>
              <li><a href="/stores" className="hover:text-gray-500 font-normal">Stores</a></li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
}





































