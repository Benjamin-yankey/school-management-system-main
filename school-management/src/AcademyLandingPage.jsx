import React, { useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import './AcademyLandingPage.css';

const AcademyLandingPage = () => {
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // State for calendar filter
  const [activeFilter, setActiveFilter] = useState('all');
  
  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs for gallery scroll
  const galleryRef = useRef(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    parentName: '',
    email: '',
    phone: '',
    parentPhone: '',
    dob: '',
    program: '',
    qualification: '',
    statement: '',
    referral: '',
    termsAgreed: false
  });
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Event cards data
  const eventCards = [
    {
      id: 1,
      category: 'wellness',
      title: 'Cognitive Breathwork',
      description: 'Optimizing focus through respiratory control.',
      date: '18',
      month: 'Sept',
      time: '08:00 AM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWxiWiWcDfbo1VX0QFdtznruR1wjI8zX389M64Gz9oNTOKgNq9PApnZvqUBy-04air8kRm93jRyuMfXjlUoUVzFqwqJXW0TnKJfzrs3wROqT_wQS3wcNuULWytVdW1q6t0jCZu6eFDJ1J2CHx_EJ9NmkLxprqJUTthuQTKrl6LD9sP5QrlsXnXsq5_KkPEGqYr1IFcTg24UdVxLBIKZTiIGMnbIbGxZv_5qELYRnPhy3JQlJO04-YSHMG2kEWTOGzLCVBfNvVVWgNz'
    },
    {
      id: 2,
      category: 'social',
      title: 'Equinox Gala',
      description: 'Networking under the synthetic stars.',
      date: '22',
      month: 'Sept',
      time: '07:30 PM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjsRBrkr6c3VXsECrA3l8n2ajYv4nRc3en0cvBcDqgAIzHzKy7uB8f4IKQyOhYRr3J7L5csf8dNkODyKPgZeSZzJygK4q-p_JCega0dLNCAskr2aFRmXxUEcR6PJKobdb4yP2qwIXBZVzSYgt-AhF3ke1624mXsRXAm30j5adcbTGQVnhUJBZd7jjw9XvuUjSfmbV3ZrffbhhHGGkXn_OTAv8Q7Mfb0-DJXhZShu-KcoNPRp3pPYncHw5aWi9QknYCd-XuKnJUKKg3'
    },
    {
      id: 3,
      category: 'academic',
      title: 'Neural Mesh Protocol',
      description: 'Deep dive into subconscious interface.',
      date: '30',
      month: 'Sept',
      time: '10:00 AM',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_1VvHdfDc8gx5tNuNLoD21bi0DHMIAV3cB_ilbAVDmqEXAA7Rv1KsPrOJ5nlnvLR69MJwIShY0b0c4lBSkMzB9tMcC1mfAiwOQgzAlGW9JlaH_QQhbbLoxv_JoKz7icy3F-DGHIl0mVRGm7dCdjqt0gvMBoI-bd3iONas5INTESYOOgXscxzjprbMsJMOMkzvNZipIzWZI_W1ECMHUzmHRsqn-8zoGHfh28N1nwJATxgR4LbXhmQvTI6fiXSzzrUjKsQv2Jio0g1J'
    }
  ];
  
  // Gallery images data
  const galleryImages = [
    { title: 'High-tech Labs', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYA_9sHZey0gDZ1pwIzP8CCrWurKkz5uA0M2KqB-R_eCdFmG4oWa6iszC9loatt0I3V67RnQWxTeOS_MzQYx15Td9Wh2-AOiTgT9zQksPV0penjQoLUitNE7S15euPJzj-F-JdeyX1K0ojK8VSk1XyFuBKltMJGLoYfwh9wgpzw-cb7KxvGYSHpujNlTlcaYTrMAa-MpWDEvYpCFjFrw7cqya5VnQf8g1GOtTiGrUI9uofP1rYQ3-sBk_IV5r3j-O8VNLnO_2cuUn' },
    { title: 'Rooftop Libraries', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSzuFHnTguXDCIp70SzHgIEFHEo1UzytA8X6bbRrKH5Ey7KyAFZkddiVQ48P4_4gMwWG6f7mQfB1sTxqmZn_4zl7C89qBwb8Bw5uV7l5N4PSlr1zw1f8AsTrXPzlfjeygK3dMVcQdHhBISfQDZSgojl_naILx_haB2fGNjFi1jBkS5-f5PHOhGvbeCKPkGZZd5TuT0-TmaikvpIn-9XPtqgxGXZ9RQSoDke-sYOQZ0tp4OyocCEAoZRu-4YnjpwxeT0exBwfxZsCX' },
    { title: 'Creative Studios', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4lVNQyIe80GjGtne6uU1dAU3pDsFasFSJiprZaSR4YFkMXlISVPk0qw8GzF3t8lI3Bjmn88_lBzbNFOy88Im6LTJPH5t2x9oeCn30irG9jOoANp8odToZv3lY8IPlNcIHreUZtR9-jTMeLUz1_9_KKEYHu7FYRJrbhDQzKRAHt_s8QndbO16Bj73KkXjf1SHWY1D5WtwX5VwTO5k-xVqInbnVcPb_NOeZaF2f3iHxDCuxIxp6Mp1kKN2mGLqczO8Tl01V-cvHCtT1' },
    { title: 'Collaboration Zones', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGAPYDx_2R8yALjbiA-GexxRVhGp0MY_oavvUaqA5HAnqz8ux7HsbBG9fJ6NpEyMVwjMuKdh71qnmhB3uiaANV-fhKNoKKBY6MMr-mEhzD57Yqq7RUAHgFGeSPerdKHnoqe7ajizxbVIveho9BsygsODuNGrzrj3F8tznERDw5C4PBeoahBp51Emkvd5cKiX8Vf63Pf7rMWQG2dtYnjGZGM7DoaAEuy_xCfoBl8P-Slj7iGjsjfkbJMvmECQzGEun8Q3QMqVDOihX' }
  ];
  
  // Faculty data
  const faculty = [
    { name: 'Dr. Alistair Thorne', role: 'Head of Innovation', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGXFdvGViuUD8JSiHxA3ySFxzm7jANqEY6fHE-7oWWHJedTD3PpbyCgcgNZHP-bBdttYkKDjBuKyq3sZz8gJdAL7Vs9hntNBvUi6UUL7LEExduQtTOJ3gLwI2BWk1x8GlYuqS06ZzrAQLAECY98zC8-_GfYCB0NQ6JvElSNvz5oAGZnEZcEaiDDpbxwNgX-t00iPr4tuKGzMm89bSgK3qE4WN2IGVwZkEV5hu_jwVZYvavTyB4z6henA7mqXqQZuG55hJF4itepfSD' },
    { name: 'Sarah J. Sterling', role: 'Creative Director', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAukSix1pPO6cMr3EUvJGntAltf1GZNy2weYVF0UVVTVHIOwkMtKxe1v_ktCaQIWRPnumaisLDkGhRAk0tyhvYfRUT7cfW-3HK-JcoKa7NxO3aL7wqV9Uz7UauHZNEdqxRfi-c-HiW_EVCG0gypET6H44inx-8Hv5egpWcby0r5_GYCYCVQ4gcmLRgPF1cMTs6TBeTdRT8M1PkXNhuNQmsYXv6hxrDX8V7NSwFRSTDYIQvBtLERSarN5jntJxYpJPARY6pmFgAqFR13' },
    { name: 'Prof. Marcus Vane', role: 'Ethics & Tech Lead', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7yCSCjeTETsQVNDZtEx00pp86ZhpSq52o6CDgWYpE2kPAJDWj9fa0HkIGcI9yDYVfKNLf_CL79Ww2DLp6cAfUG4ueA4TXfm6AwIDtui_C0uoVmrcnuVLVH7irWwsfcqddgBbtOtPT2rcKyUBXdUO0XJ2eYkdN4lnnV2hehWtJEyouDoWDZ_XG_Pg9SCouu9-NijcMCuI0Vd67TglM-6BUW1E5SxguLpnxBLZjJvBP5tYpqZTVnDjsL9MS8tATbgLcSQIynhgiZ7dC' },
    { name: 'Dr. Elena Rossi', role: 'Quantum Physics', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgowwrKP3HqzG1TbEFHjvdIBXCrPzz03Nfc2Wr-KlfGOl9Z3Fpgq8GMc5tVmoARgMv7HtSD9yxFN3JEgk5wEzj0OsAeywEBL4pO5K29FyN_ALHKS9_kdRBW7SJwyU_r_oVMTxPHYBBgpKk6xvWQmyCcTYYZdAieBE8yOhIHVBa7CrLJ4Qh9jqYgmW64C69Lwz6-KaBmfRAzxHww8zDdz3Tfx5aaZq0Qxw9sM-KRpFkuvAZymncW1mzkh4Nik0Lw-ILplBGeRAvOr2v' }
  ];
  
  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4000);
  };
  
  // Open modal
  const openModal = () => {
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = '';
  };
  
  // Handle form input change
  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName) {
      showToast('Please enter your full name.', 'error');
      return;
    }
    if (!formData.email) {
      showToast('Please enter your email address.', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }
    if (!formData.phone) {
      showToast('Please enter your phone number.', 'error');
      return;
    }
    if (formData.phone.length < 10) {
      showToast('Please enter a valid phone number.', 'error');
      return;
    }
    if (!formData.dob) {
      showToast('Please enter your date of birth.', 'error');
      return;
    }
    if (!formData.program) {
      showToast('Please select a program of interest.', 'error');
      return;
    }
    if (!formData.termsAgreed) {
      showToast('Please agree to the terms and conditions.', 'error');
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      showToast('✓ Your inquiry has been submitted successfully! We will contact you soon.');
      
      // Reset form
      setFormData({
        fullName: '',
        parentName: '',
        email: '',
        phone: '',
        parentPhone: '',
        dob: '',
        program: '',
        qualification: '',
        statement: '',
        referral: '',
        termsAgreed: false
      });
      
      // Close modal after delay
      setTimeout(() => {
        closeModal();
      }, 2000);
    }, 1500);
  };
  
  // Handle filter change
  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };
  
  // Scroll gallery
  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const { scrollLeft, clientWidth } = galleryRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      galleryRef.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };
  
  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Filter events
  const filteredEvents = activeFilter === 'all' 
    ? eventCards 
    : eventCards.filter(event => event.category === activeFilter);

  return (
    <div className="academy-landing">
      {/* Navigation */}
      <nav className={`navbar-modern ${isMobileMenuOpen ? 'mobile-active' : ''}`}>
        <div className="nav-container">
 feature/styling
          <Link to="/" className="nav-logo">
            <span className="logo-icon">A</span>
            <span className="logo-text">THE ACADEMY</span>
          </Link>
          
          <div className="nav-toggle" onClick={toggleMobileMenu}>
            <span className="material-symbols-outlined">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>

          <div className="nav-left">
            <Link to="/" className="logo">THE ACADEMY</Link>
            <div className="desktop-menu">
              <Link to="/original" className="nav-link active">Original</Link>
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/signin" className="nav-link">Sign In</Link>
              <Link to="/signup" className="nav-link">Sign Up</Link>
            </div>
 main
          </div>
          
          <ul className="nav-links-modern">
            <li><Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>Experience</Link></li>
            <li><Link to="/programs" onClick={() => setIsMobileMenuOpen(false)}>Curriculum</Link></li>
            <li><Link to="/campus" onClick={() => setIsMobileMenuOpen(false)}>Sanctuary</Link></li>
            <li><Link to="/admissions" onClick={() => setIsMobileMenuOpen(false)}>Join Us</Link></li>
          </ul>
          
          <div className="nav-actions-modern">
            <Link to="/signin" className="portal-link">Portal</Link>
            <button className="cta-button-nav" onClick={() => { openModal(); setIsMobileMenuOpen(false); }}>Apply Now</button>
          </div>
        </div>
 feature/styling

        {isMobileMenuOpen && (
          <div className="mobile-menu">
            <Link to="/original" className="mobile-nav-link active" onClick={() => setIsMobileMenuOpen(false)}>Original</Link>
            <Link to="/" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            <Link to="/signin" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
            <Link to="/signup" className="mobile-nav-link" onClick={() => setIsMobileMenuOpen(false)}>Sign Up</Link>
          </div>
        )}
 main
      </nav>

      <main className="main-content-modern">
        {/* Hero Section */}
        <section className="hero-modern">
          <div className="hero-video-container">
            <div className="hero-overlay-gradient"></div>
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQzjrgtnRd05hN4zW2f8_TcmY-yW1v5p0owBUOCcKDfouChAMHqBhusBJ8SzDnzftwIuj8U8HfhyeZqCO5QUEZ3vhgjVIKvsbl3k9ZlgulGSWVHkQWA2Z_I3RM8yQQDs38N_Yl2RWoQ8WRJTZRZK7b-aB86H7eNmavldwXQKDwQ_RyTN8nEgVUujdKf8adSsnSZ8VRRp029JjeSkdxpNe-0nuvbWeFvKux0RpZMNPSmKtk7tEkE3sw8ZQN9wRuzFzxfw1pVshSbjtx" 
              alt="Academy Architecture" 
              className="hero-fallback-image"
            />
          </div>
          
          <div className="hero-content-modern">
            <div className="hero-badge-modern animate-fade-in">
              <span className="material-symbols-outlined">auto_awesome</span>
              <span>Enrollment Phase 2024 Now Active</span>
            </div>
            <h1 className="hero-title-modern animate-slide-up">
              Architecting the <br />
              <span className="neon-text">Future Mind</span>
            </h1>
            <p className="hero-subtitle-modern animate-slide-up delay-1">
              Welcome to a sanctuary of radical innovation and classical wisdom. Where we don't just teach the future—we build it.
            </p>
            <div className="hero-buttons-modern animate-slide-up delay-2">
              <button className="primary-cta" onClick={openModal}>Start Your Application</button>
              <Link to="/home" className="secondary-cta">Explore the Campus</Link>
            </div>
          </div>
          
          <div className="scroll-indicator">
            <div className="mouse">
              <div className="wheel"></div>
            </div>
            <span>Scroll to explore</span>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats-section-modern">
          <div className="stats-container-modern">
            <div className="stat-item-modern">
              <span className="stat-value-modern">98%</span>
              <span className="stat-label-modern">Placement at Global Tech Hubs</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item-modern">
              <span className="stat-value-modern">45+</span>
              <span className="stat-label-modern">International Partnerships</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item-modern">
              <span className="stat-value-modern">1:8</span>
              <span className="stat-label-modern">Faculty to Student Ratio</span>
            </div>
          </div>
        </section>

        {/* Vision Section */}
        <section className="vision-section-modern">
          <div className="vision-container-modern">
            <div className="vision-grid-modern">
              <div className="vision-text-modern">
                <h2 className="vision-title-modern">The Neon Sanctuary</h2>
                <p className="vision-paragraph-modern">
                  The Academy is more than an institution; it's a meticulously designed ecosystem for intellectual and creative expansion. We blend centuries of pedagogical wisdom with cutting-edge environmental psychology and cognitive science.
                </p>
                <div className="vision-features-modern">
                  <div className="v-feature">
                    <div className="v-icon-box"><span className="material-symbols-outlined">neurology</span></div>
                    <div>
                      <h4>Neural-Adaptive Learning</h4>
                      <p>Curriculums that evolve with your unique cognitive profile.</p>
                    </div>
                  </div>
                  <div className="v-feature">
                    <div className="v-icon-box"><span className="material-symbols-outlined">diamond</span></div>
                    <div>
                      <h4>The Elite Network</h4>
                      <p>Connect with industry titans and visionary researchers globally.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="vision-visual-modern">
                <div className="floating-card glass-card-modern">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtg9Fsc-fF3vE7z61T98GvN6M8qj-0zT1f8m58_fK3V0Wp_O8n7_1l_9L8o7_1l_9L8o7_1l_9L8o7_1l_9L8o7_1l_9L8" 
                    alt="Innovation Lab" 
                  />
                  <div className="floating-badge">
                    <span className="material-symbols-outlined">bolt</span>
                    <span>Hyper-Labs Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gallery Section */}
        <section className="gallery-section-modern">
          <div className="section-header-modern">
            <h2 className="section-title-modern">Campus Life</h2>
            <div className="gallery-nav-modern">
              <button className="g-nav-btn" onClick={() => scrollGallery('left')}><span className="material-symbols-outlined">west</span></button>
              <button className="g-nav-btn" onClick={() => scrollGallery('right')}><span className="material-symbols-outlined">east</span></button>
            </div>
          </div>
          <div className="gallery-container-modern" ref={galleryRef}>
            {galleryImages.map((item, idx) => (
              <div key={idx} className="gallery-card-modern">
                <img src={item.image} alt={item.title} />
                <div className="gallery-overlay-modern">
                  <h3>{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar Section */}
        <section className="calendar-section-modern">
          <div className="calendar-container-modern">
            <div className="calendar-sidebar">
              <h2 className="section-title-modern">Upcoming explorations</h2>
              <div className="filter-list-modern">
                {['all', 'academic', 'social', 'wellness'].map(filter => (
                  <button 
                    key={filter}
                    className={`filter-link-modern ${activeFilter === filter ? 'active' : ''}`}
                    onClick={() => handleFilterClick(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="calendar-main">
              <div className="event-stack-modern">
                {filteredEvents.map(event => (
                  <div key={event.id} className="event-card-modern glass-card-modern">
                    <div className="event-image-modern">
                      <img src={event.image} alt={event.title} />
                    </div>
                    <div className="event-content">
                      <div className="event-info">
                        <div>
                          <h3 className="event-title">{event.title}</h3>
                          <p className="event-description">{event.description}</p>
                        </div>
                        <div className="event-date">
                          <div className="event-day">{event.date}</div>
                          <div className="event-month">{event.month}</div>
                        </div>
                      </div>
                      <div className="event-footer">
                        <span className="event-time">
                          <span className="material-symbols-outlined">schedule</span> {event.time}
                        </span>
                        <button className="event-add-btn" onClick={() => alert('📅 Event added to your calendar (demo)')}>
                          Add to Calendar <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Faculty Section */}
        <section className="faculty-section">
          <div className="faculty-container">
            <div className="faculty-header">
              <h2 className="faculty-title">Visionary Minds</h2>
              <p className="faculty-subtitle">Our mentors are world-renowned researchers and creators.</p>
            </div>
            <div className="faculty-grid">
              {faculty.map((member, idx) => (
                <div key={idx} className="faculty-card-modern">
                  <div className="faculty-img-wrapper">
                    <img src={member.image} alt={member.name} />
                  </div>
                  <div className="faculty-info-modern">
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-banner-modern">
          <div className="cta-card-modern">
            <div className="cta-blur-blob"></div>
            <h2 className="cta-title-modern">Ready to Architect Your Future?</h2>
            <p className="cta-text-modern">Secure your place in the next academic cycle. Limited slots available for the Innovation Cohort.</p>
            <div className="cta-actions-modern">
              <button className="cta-btn-primary" onClick={openModal}>Book a Private Consultation</button>
              <Link to="/admissions" className="cta-btn-secondary">View Admissions Roadmap</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer-modern">
        <div className="footer-container-modern">
          <div className="footer-top">
            <div className="footer-brand-modern">
              <span className="logo-text">THE ACADEMY</span>
              <p>A Century of Excellence, Re-engineered for the Digital Frontier.</p>
            </div>
            <div className="footer-nav-modern">
              <div className="footer-col">
                <h4>Experience</h4>
                <Link to="/home">Campus Life</Link>
                <Link to="/programs">Curriculum</Link>
                <Link to="/admissions">Admissions</Link>
              </div>
              <div className="footer-col">
                <h4>Resources</h4>
                <Link to="/signin">Student Portal</Link>
                <Link to="/signin">Faculty Access</Link>
                <Link to="/signin">Parent Portal</Link>
              </div>
              <div className="footer-col">
                <h4>Connect</h4>
                <a href="#">X / Twitter</a>
                <a href="#">Instagram</a>
                <a href="#">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom-modern">
            <p>© 2024 The Academy. All Rights Reserved.</p>
            <div className="footer-legal">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Application Modal */}
      {isModalOpen && (
        <div className="modal-overlay-modern" onClick={closeModal}>
          <div className="modal-card-modern glass-card-modern" onClick={e => e.stopPropagation()}>
            <button className="modal-close-modern" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="modal-header-modern">
              <h2>Join the Cohort</h2>
              <p>Please provide your academic details for a personalized evaluation.</p>
            </div>
            
            <form className="modal-form-modern" onSubmit={handleSubmit}>
              <div className="form-grid-modern">
                <div className="form-group-modern">
                  <label htmlFor="fullName">Full Name</label>
                  <input type="text" id="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Candidate's name" required />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="email">Email Address</label>
                  <input type="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="email@example.com" required />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="phone">Phone Number</label>
                  <input type="tel" id="phone" value={formData.phone} onChange={handleInputChange} placeholder="+1 (555) 000-0000" required />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="dob">Date of Birth</label>
                  <input type="date" id="dob" value={formData.dob} onChange={handleInputChange} required />
                </div>
                <div className="form-group-modern">
                  <label htmlFor="program">Program of Interest</label>
                  <select id="program" value={formData.program} onChange={handleInputChange} required>
                    <option value="">Select a track</option>
                    <option value="innovation">Innovation & Tech</option>
                    <option value="humanities">Classical Humanities</option>
                    <option value="science">Applied Sciences</option>
                  </select>
                </div>
                <div className="form-group-modern">
                  <label htmlFor="qualification">Current Level</label>
                  <input type="text" id="qualification" value={formData.qualification} onChange={handleInputChange} placeholder="e.g. Grade 12" />
                </div>
              </div>
              
              <div className="form-group-modern full-width">
                <label htmlFor="statement">Aspirations (Optional)</label>
                <textarea id="statement" value={formData.statement} onChange={handleInputChange} placeholder="Briefly describe your vision..." rows="3"></textarea>
              </div>
              
              <div className="form-checkbox-modern">
                <input type="checkbox" id="termsAgreed" checked={formData.termsAgreed} onChange={handleInputChange} required />
                <label htmlFor="termsAgreed">I agree to the privacy policy and data processing terms.</label>
              </div>
              
              <button type="submit" className="submit-btn-modern" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="loader-dots">Processing<span>.</span><span>.</span><span>.</span></span>
                ) : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-modern ${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <p>{toast.message}</p>
        </div>
      )}
    </div>
  );
};

export default AcademyLandingPage;
