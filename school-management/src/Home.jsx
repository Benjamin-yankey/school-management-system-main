import React,{ useState, useEffect, useRef } from 'react';
import { Link } from "react-router-dom";
import './Home.css';

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    termsAgree: false
  });
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const galleryRef = useRef(null);

  const navLinks = [
    { label: 'Home', to: '/', active: true },
    { label: 'Programs', to: '/programs', active: false },
    { label: 'Campus', to: '/campus', active: false },
    { label: 'Admissions', to: '/admissions', active: false },
  ];

  const stats = [
    { value: '98', suffix: '%', label: 'Graduate Placement', description: 'Securing positions within Fortune 500 companies and elite research labs within 6 months.' },
    { value: 'Top 1', suffix: '%', label: 'Research Output', description: 'Globally recognized contributions to Artificial Intelligence, Bio-Engineering, and FinTech.' },
    { value: '50', suffix: '+', label: 'Global Partnerships', description: 'Collaborative academic ventures with Ivy League and leading technological institutes.' },
  ];

  const galleryItems = [
    { title: 'High-tech Labs', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYA_9sHZey0gDZ1pwIzP8CCrWurKkz5uA0M2KqB-R_eCdFmG4oWa6iszC9loatt0I3V67RnQWxTeOS_MzQYx15Td9Wh2-AOiTgT9zQksPV0penjQoLUitNE7S15euPJzj-F-JdeyX1K0ojK8VSk1XyFuBKltMJGLoYfwh9wgpzw-cb7KxvGYSHpujNlTlcaYTrMAa-MpWDEvYpCFjFrw7cqya5VnQf8g1GOtTiGrUI9uofP1rYQ3-sBk_IV5r3j-O8VNLnO_2cuUn', description: 'State-of-the-art laboratories equipped with cutting-edge technology for hands-on learning and research.' },
    { title: 'Rooftop Libraries', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSzuFHnTguXDCIp70SzHgIEFHEo1UzytA8X6bbRrKH5Ey7KyAFZkddiVQ48P4_4gMwWG6f7mQfB1sTxqmZn_4zl7C89qBwb8Bw5uV7l5N4PSlr1zw1f8AsTrXPzlfjeygK3dMVcQdHhBISfQDZSgojl_naILx_haB2fGNjFi1jBkS5-f5PHOhGvbeCKPkGZZd5TuT0-TmaikvpIn-9XPtqgxGXZ9RQSoDke-sYOQZ0tp4OyocCEAoZRu-4YnjpwxeT0exBwfxZsCX', description: 'Serene study spaces with panoramic views, perfect for focused reading and academic exploration.' },
    { title: 'Creative Studios', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4lVNQyIe80GjGtne6uU1dAU3pDsFasFSJiprZaSR4YFkMXlISVPk0qw8GzF3t8lI3Bjmn88_lBzbNFOy88Im6LTJPH5t2x9oeCn30irG9jOoANp8odToZv3lY8IPlNcIHreUZtR9-jTMeLUz1_9_KKEYHu7FYRJrbhDQzKRAHt_s8QndbO16Bj73KkXjf1SHWY1D5WtwX5VwTO5k-xVqInbnVcPb_NOeZaF2f3iHxDCuxIxp6Mp1kKN2mGLqczO8Tl01V-cvHCtT1', description: 'Inspiring spaces designed for artistic expression, innovation, and creative collaboration.' },
    { title: 'Collaboration Zones', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGAPYDx_2R8yALjbiA-GexxRVhGp0MY_oavvUaqA5HAnqz8ux7HsbBG9fJ6NpEyMVwjMuKdh71qnmhB3uiaANV-fhKNoKKBY6MMr-mEhzD57Yqq7RUAHgFGeSPerdKHnoqe7ajizxbVIveho9BsygsODuNGrzrj3F8tznERDw5C4PBeoahBp51Emkvd5cKiX8Vf63Pf7rMWQG2dtYnjGZGM7DoaAEuy_xCfoBl8P-Slj7iGjsjfkbJMvmECQzGEun8Q3QMqVDOihX', description: 'Dynamic environments that foster teamwork, communication, and collaborative problem-solving.' },
  ];

  const allEvents = [
    { category: 'wellness', title: 'Cognitive Breathwork', date: 18, month: 'Sept', time: '08:00 AM', description: 'Optimizing focus through respiratory control.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBWxiWiWcDfbo1VX0QFdtznruR1wjI8zX389M64Gz9oNTOKgNq9PApnZvqUBy-04air8kRm93jRyuMfXjlUoUVzFqwqJXW0TnKJfzrs3wROqT_wQS3wcNuULWytVdW1q6t0jCZu6eFDJ1J2CHx_EJ9NmkLxprqJUTthuQTKrl6LD9sP5QrlsXnXsq5_KkPEGqYr1IFcTg24UdVxLBIKZTiIGMnbIbGxZv_5qELYRnPhy3JQlJO04-YSHMG2kEWTOGzLCVBfNvVVWgNz' },
    { category: 'social', title: 'Equinox Gala', date: 22, month: 'Sept', time: '07:30 PM', description: 'Networking under the synthetic stars.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjsRBrkr6c3VXsECrA3l8n2ajYv4nRc3en0cvBcDqgAIzHzKy7uB8f4IKQyOhYRr3J7L5csf8dNkODyKPgZeSZzJygK4q-p_JCega0dLNCAskr2aFRmXxUEcR6PJKobdb4yP2qwIXBZVzSYgt-AhF3ke1624mXsRXAm30j5adcbTGQVnhUJBZd7jjw9XvuUjSfmbV3ZrffbhhHGGkXn_OTAv8Q7Mfb0-DJXhZShu-KcoNPRp3pPYncHw5aWi9QknYCd-XuKnJUKKg3' },
    { category: 'academic', title: 'Neural Mesh Protocol', date: 30, month: 'Sept', time: '10:00 AM', description: 'Deep dive into subconscious interface.', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_1VvHdfDc8gx5tNuNLoD21bi0DHMIAV3cB_ilbAVDmqEXAA7Rv1KsPrOJ5nlnvLR69MJwIShY0b0c4lBSkMzB9tMcC1mfAiwOQgzAlGW9JlaH_QQhbbLoxv_JoKz7icy3F-DGHIl0mVRGm7dCdjqt0gvMBoI-bd3iONas5INTESYOOgXscxzjprbMsJMOMkzvNZipIzWZI_W1ECMHUzmHRsqn-8zoGHfh28N1nwJATxgR4LbXhmQvTI6fiXSzzrUjKsQv2Jio0g1J' },
  ];

  const faculty = [
    { name: 'Dr. Alistair Thorne', role: 'Head of Innovation', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGXFdvGViuUD8JSiHxA3ySFxzm7jANqEY6fHE-7oWWHJedTD3PpbyCgcgNZHP-bBdttYkKDjBuKyq3sZz8gJdAL7Vs9hntNBvUi6UUL7LEExduQtTOJ3gLwI2BWk1x8GlYuqS06ZzrAQLAECY98zC8-_GfYCB0NQ6JvElSNvz5oAGZnEZcEaiDDpbxwNgX-t00iPr4tuKGzMm89bSgK3qE4WN2IGVwZkEV5hu_jwVZYvavTyB4z6henA7mqXqQZuG55hJF4itepfSD' },
    { name: 'Sarah J. Sterling', role: 'Creative Director', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAukSix1pPO6cMr3EUvJGntAltf1GZNy2weYVF0UVVTVHIOwkMtKxe1v_ktCaQIWRPnumaisLDkGhRAk0tyhvYfRUT7cfW-3HK-JcoKa7NxO3aL7wqV9Uz7UauHZNEdqxRfi-c-HiW_EVCG0gypET6H44inx-8Hv5egpWcby0r5_GYCYCVQ4gcmLRgPF1cMTs6TBeTdRT8M1PkXNhuNQmsYXv6hxrDX8V7NSwFRSTDYIQvBtLERSarN5jntJxYpJPARY6pmFgAqFR13' },
    { name: 'Prof. Marcus Vane', role: 'Ethics & Tech Lead', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7yCSCjeTETsQVNDZtEx00pp86ZhpSq52o6CDgWYpE2kPAJDWj9fa0HkIGcI9yDYVfKNLf_CL79Ww2DLp6cAfUG4ueA4TXfm6AwIDtui_C0uoVmrcnuVLVH7irWwsfcqddgBbtOtPT2rcKyUBXdUO0XJ2eYkdN4lnnV2hehWtJEyouDoWDZ_XG_Pg9SCouu9-NijcMCuI0Vd67TglM-6BUW1E5SxguLpnxBLZjJvBP5tYpqZTVnDjsL9MS8tATbgLcSQIynhgiZ7dC' },
    { name: 'Dr. Elena Rossi', role: 'Quantum Physics', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDgowwrKP3HqzG1TbEFHjvdIBXCrPzz03Nfc2Wr-KlfGOl9Z3Fpgq8GMc5tVmoARgMv7HtSD9yxFN3JEgk5wEzj0OsAeywEBL4pO5K29FyN_ALHKS9_kdRBW7SJwyU_r_oVMTxPHYBBgpKk6xvWQmyCcTYYZdAieBE8yOhIHVBa7CrLJ4Qh9jqYgmW64C69Lwz6-KaBmfRAzxHww8zDdz3Tfx5aaZq0Qxw9sM-KRpFkuvAZymncW1mzkh4Nik0Lw-ILplBGeRAvOr2v' },
  ];

  const filters = ['all', 'academic', 'social', 'wellness'];

  // Filter events based on active filter - React way
  const filteredEvents = activeFilter === 'all' 
    ? allEvents 
    : allEvents.filter(event => event.category === activeFilter);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.home-page .navbar');
      if (navbar) {
        if (window.scrollY > 50) {
          navbar.classList.add('scrolled');
        } else {
          navbar.classList.remove('scrolled');
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [modalOpen]);

  const scrollGallery = (direction) => {
    if (galleryRef.current) {
      const scrollAmount = 400;
      galleryRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  const openModal = () => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = '';
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    setTimeout(() => {
      showToast('✓ Application submitted successfully! Check your email for confirmation.', 'success');
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
        termsAgree: false
      });
      setSubmitting(false);
      setTimeout(() => closeModal(), 1500);
    }, 800);
  };

  return (
    <div className="home-page">
      {/* TopNavBar */}
      <nav className={`navbar ${isMenuOpen ? 'mobile-active' : ''}`}>
        <div className="navbar-brand">
          <Link to="/" className="logo-link">
            <div className="logo-container">
              <img
                src="https://res.cloudinary.com/dj6hpfbdr/image/upload/v1774652911/WhatsApp_Image_2026-03-27_at_8.38.37_AM_gi3o6b.jpg"
                alt="The Academy Logo"
                className="logo-image"
              />
              <span className="logo-text">Geoziie International School</span>
            </div>
          </Link>
          <button className="mobile-menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <span className="material-symbols-outlined">{isMenuOpen ? 'close' : 'menu'}</span>
          </button>
          
          <div className="navbar-links">
            {navLinks.map((link, index) => (
              <Link
                key={index}
                className={link.active ? 'nav-link active' : 'nav-link'}
                to={link.to}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="nav-actions">
          <div className="nav-auth-links">
            <Link className="nav-auth-link" to="/signin">
              Sign In
            </Link>
            <Link className="nav-auth-link nav-auth-link-emphasis" to="/signup">
              Sign Up
            </Link>
          </div>
          <Link className="primary-btn" to="/admissions">
            Apply Now
          </Link>
        </div>
      </nav>
      <main className="main-content">
        {/* Immersive Hero */}
        <section className="hero-section">
          <div className="hero-bg">
            <img
              alt="Campus Architecture"
              className="hero-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQzjrgtnRd05hN4zW2f8_TcmY-yW1v5p0owBUOCcKDfouChAMHqBhusBJ8SzDnzftwIuj8U8HfhyeZqCO5QUEZ3vhgjVIKvsbl3k9ZlgulGSWVHkQWA2Z_I3RM8yQQDs38N_Yl2RWoQ8WRJTZRZK7b-aB86H7eNmavldwXQKDwQ_RyTN8nEgVUujdKf8adSsnSZ8VRRp029JjeSkdxpNe-0nuvbWeFvKux0RpZMNPSmKtk7tEkE3sw8ZQN9wRuzFzxfw1pVshSbjtx"
            />
            <div className="hero-gradient-overlay"></div>
          </div>
          <div className="hero-content">
            <span className="hero-badge">Enrollment Open for 2024</span>
            <h1 className="hero-title">
              Nurturing Tomorrow's <br />
              <span className="gradient-text">Leaders Today</span>
            </h1>
            <p className="hero-description">
              Welcome to Geoziie International School, where we provide a world-class education in a supportive and stimulating environment. Our dedicated faculty and state-of-the-art facilities ensure every student reaches their full potential.
            </p>
            <div className="hero-buttons">
              <Link className="primary-btn primary-btn-lg" to="/admissions">
                Apply Now
              </Link>
              <Link className="secondary-btn secondary-btn-lg" to="/signin">
                Parent Portal
              </Link>
            </div>
          </div>
        </section>

         

        
 
         

         

        {/* Our Legacy & Future */}
        <section className="legacy-section">
          <div className="legacy-container">
            <div className="legacy-image-wrapper">
              <div className="legacy-blur"></div>
              <div className="legacy-image-frame glass-card">
                <img
                  alt="Legacy Image"
                  className="legacy-image grayscale-hover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKsQZVc_WWJDMdmasyABl0BQwJOsBGsLwNUU_V0rLFRB1R2KZlvyWgBJ0DPcpEAV9KLQ0xdwiN2S6zBgMXQM-2LDtGwUlz8bOcop_zQKrRRIcmHutk16HAQVJsjgZdcihjFlunk33e_uXyPYKEjpacb15prUgFUrmKQ6o68YHzFKookDDkfMIZzxLVmw84Vvx6GlgEYe8rVJ6rPQBL85vK3cU2zDTLx8zPmIb2rQHiF0mWrskdLzJrslHXapkCjE3F41RCS6ydljt7"
                />
              </div>
              <div className="year-badge glass-card">
                <div className="year-badge-value">2008</div>
                <div className="year-badge-label">Founded</div>
              </div>
            </div>
            <div className="legacy-content">
              <h2 className="section-title">Our Heritage & Vision</h2>
              <p className="section-text">
                Founded with a commitment to academic excellence, Geoziie International School has grown from a small institution into a leading private school. We honor our rich heritage while embracing innovative teaching methods that prepare students for the challenges of tomorrow.
              </p>
              <p className="section-text">
                Our school is a place where tradition meets innovation—a nurturing environment where students are encouraged to explore, question, and grow. We don't just educate; we inspire lifelong learners and responsible global citizens.
              </p>
              <div className="legacy-link-wrapper">
                <a className="text-link" href="#">
                  Learn More About Us
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* About Us Section */}
        <section className="about-us-section">
          <div className="about-us-container">
            <div className="about-us-header">
              <h2 className="section-title">About Geoziie International School</h2>
              <p className="section-subtitle">Where tradition meets innovation</p>
            </div>
            <div className="about-us-content">
              <div className="about-us-grid">
                <div className="about-us-card glass-card">
                  <div className="about-us-icon">
                    <span className="material-symbols-outlined">school</span>
                  </div>
                  <h3>Our Mission</h3>
                  <p>
                    To provide a nurturing and challenging educational environment that empowers students to achieve academic excellence, develop strong character, and become responsible global citizens prepared for success in an ever-changing world.
                  </p>
                </div>
                <div className="about-us-card glass-card">
                  <div className="about-us-icon">
                    <span className="material-symbols-outlined">visibility</span>
                  </div>
                  <h3>Our Vision</h3>
                  <p>
                    To be recognized as a premier private school that inspires a love of learning, fosters creativity and innovation, and develops well-rounded individuals who make meaningful contributions to society.
                  </p>
                </div>
                <div className="about-us-card glass-card">
                  <div className="about-us-icon">
                    <span className="material-symbols-outlined">psychology</span>
                  </div>
                  <h3>Our Approach</h3>
                  <p>
                    We combine rigorous academic standards with personalized attention, innovative teaching methods, and a supportive community to ensure every student thrives academically, socially, and emotionally.
                  </p>
                </div>
              </div>
              <div className="about-us-stats">
                <div className="about-us-stat">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Years of Excellence</div>
                </div>
                <div className="about-us-stat">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Students Enrolled</div>
                </div>
                <div className="about-us-stat">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Qualified Teachers</div>
                </div>
                <div className="about-us-stat">
                  <div className="stat-number">98%</div>
                  <div className="stat-label">Parent Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <section className="achievements-section">
          <div className="achievements-container">
            <div className="achievements-header">
              <h2 className="section-title">Our Achievements</h2>
              <p className="section-subtitle">Celebrating excellence and success</p>
            </div>
            <div className="achievements-grid">
              <div className="achievement-card">
                <div className="achievement-image-wrapper">
                  <img
                    alt="Academic Excellence Award"
                    className="achievement-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSYA_9sHZey0gDZ1pwIzP8CCrWurKkz5uA0M2KqB-R_eCdFmG4oWa6iszC9loatt0I3V67RnQWxTeOS_MzQYx15Td9Wh2-AOiTgT9zQksPV0penjQoLUitNE7S15euPJzj-F-JdeyX1K0ojK8VSk1XyFuBKltMJGLoYfwh9wgpzw-cb7KxvGYSHpujNlTlcaYTrMAa-MpWDEvYpCFjFrw7cqya5VnQf8g1GOtTiGrUI9uofP1rYQ3-sBk_IV5r3j-O8VNLnO_2cuUn"
                  />
                  <div className="achievement-overlay">
                    <span className="material-symbols-outlined">emoji_events</span>
                  </div>
                </div>
                <div className="achievement-content">
                  <h3>Academic Excellence Award</h3>
                  <p>
                    Recognized for outstanding academic performance and innovative teaching methodologies that consistently produce top-performing students.
                  </p>
                  <div className="achievement-badge">
                    <span className="material-symbols-outlined">verified</span>
                    <span>2023 Winner</span>
                  </div>
                </div>
              </div>

              <div className="achievement-card">
                <div className="achievement-image-wrapper">
                  <img
                    alt="Sports Championship"
                    className="achievement-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuACSzuFHnTguXDCIp70SzHgIEFHEo1UzytA8X6bbRrKH5Ey7KyAFZkddiVQ48P4_4gMwWG6f7mQfB1sTxqmZn_4zl7C89qBwb8Bw5uV7l5N4PSlr1zw1f8AsTrXPzlfjeygK3dMVcQdHhBISfQDZSgojl_naILx_haB2fGNjFi1jBkS5-f5PHOhGvbeCKPkGZZd5TuT0-TmaikvpIn-9XPtqgxGXZ9RQSoDke-sYOQZ0tp4OyocCEAoZRu-4YnjpwxeT0exBwfxZsCX"
                  />
                  <div className="achievement-overlay">
                    <span className="material-symbols-outlined">sports_soccer</span>
                  </div>
                </div>
                <div className="achievement-content">
                  <h3>Regional Sports Champions</h3>
                  <p>
                    Our athletes have consistently demonstrated excellence, winning multiple regional championships and fostering a culture of sportsmanship.
                  </p>
                  <div className="achievement-badge">
                    <span className="material-symbols-outlined">verified</span>
                    <span>15+ Trophies</span>
                  </div>
                </div>
              </div>

              <div className="achievement-card">
                <div className="achievement-image-wrapper">
                  <img
                    alt="Community Service Award"
                    className="achievement-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4lVNQyIe80GjGtne6uU1dAU3pDsFasFSJiprZaSR4YFkMXlISVPk0qw8GzF3t8lI3Bjmn88_lBzbNFOy88Im6LTJPH5t2x9oeCn30irG9jOoANp8odToZv3lY8IPlNcIHreUZtR9-jTMeLUz1_9_KKEYHu7FYRJrbhDQzKRAHt_s8QndbO16Bj73KkXjf1SHWY1D5WtwX5VwTO5k-xVqInbnVcPb_NOeZaF2f3iHxDCuxIxp6Mp1kKN2mGLqczO8Tl01V-cvHCtT1"
                  />
                  <div className="achievement-overlay">
                    <span className="material-symbols-outlined">volunteer_activism</span>
                  </div>
                </div>
                <div className="achievement-content">
                  <h3>Community Service Award</h3>
                  <p>
                    Honored for our commitment to community engagement and social responsibility,培养学生 who are not just academically优秀 but also socially conscious.
                  </p>
                  <div className="achievement-badge">
                    <span className="material-symbols-outlined">verified</span>
                    <span>2024 Recipient</span>
                  </div>
                </div>
              </div>

              <div className="achievement-card">
                <div className="achievement-image-wrapper">
                  <img
                    alt="Arts & Culture Festival"
                    className="achievement-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHGAPYDx_2R8yALjbiA-GexxRVhGp0MY_oavvUaqA5HAnqz8ux7HsbBG9fJ6NpEyMVwjMuKdh71qnmhB3uiaANV-fhKNoKKBY6MMr-mEhzD57Yqq7RUAHgFGeSPerdKHnoqe7ajizxbVIveho9BsygsODuNGrzrj3F8tznERDw5C4PBeoahBp51Emkvd5cKiX8Vf63Pf7rMWQG2dtYnjGZGM7DoaAEuy_xCfoBl8P-Slj7iGjsjfkbJMvmECQzGEun8Q3QMqVDOihX"
                  />
                  <div className="achievement-overlay">
                    <span className="material-symbols-outlined">palette</span>
                  </div>
                </div>
                <div className="achievement-content">
                  <h3>Arts & Culture Festival</h3>
                  <p>
                    Our students showcase their creative talents through annual arts festivals, exhibitions, and performances that celebrate diversity and artistic expression.
                  </p>
                  <div className="achievement-badge">
                    <span className="material-symbols-outlined">verified</span>
                    <span>Annual Event</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

         
        {/* Academic Programs Section */}
        <section className="programs-section">
          <div className="programs-container">
            <div className="programs-header">
              <h2 className="section-title">Academic Programs</h2>
              <p className="section-subtitle">Discover pathways to excellence</p>
            </div>
            <div className="programs-grid">
              <div className="program-card">
                <div className="program-image-wrapper">
                  <img
                    alt="Innovation & Technology"
                    className="program-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSYA_9sHZey0gDZ1pwIzP8CCrWurKkz5uA0M2KqB-R_eCdFmG4oWa6iszC9loatt0I3V67RnQWxTeOS_MzQYx15Td9Wh2-AOiTgT9zQksPV0penjQoLUitNE7S15euPJzj-F-JdeyX1K0ojK8VSk1XyFuBKltMJGLoYfwh9wgpzw-cb7KxvGYSHpujNlTlcaYTrMAa-MpWDEvYpCFjFrw7cqya5VnQf8g1GOtTiGrUI9uofP1rYQ3-sBk_IV5r3j-O8VNLnO_2cuUn"
                  />
                  <div className="program-overlay">
                    <span className="material-symbols-outlined">computer</span>
                  </div>
                </div>
                <div className="program-content">
                  <h3>STEM Excellence</h3>
                  <p>
                    Our comprehensive STEM program develops critical thinking and problem-solving skills through hands-on learning in science, technology, engineering, and mathematics.
                  </p>
                  <div className="program-features">
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Robotics & Coding
                    </span>
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Science Labs
                    </span>
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Mathematics Excellence
                    </span>
                  </div>
                  <Link to="/programs" className="program-link">
                    Learn More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="program-card">
                <div className="program-image-wrapper">
                  <img
                    alt="Classical Humanities"
                    className="program-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuACSzuFHnTguXDCIp70SzHgIEFHEo1UzytA8X6bbRrKH5Ey7KyAFZkddiVQ48P4_4gMwWG6f7mQfB1sTxqmZn_4zl7C89qBwb8Bw5uV7l5N4PSlr1zw1f8AsTrXPzlfjeygK3dMVcQdHhBISfQDZSgojl_naILx_haB2fGNjFi1jBkS5-f5PHOhGvbeCKPkGZZd5TuT0-TmaikvpIn-9XPtqgxGXZ9RQSoDke-sYOQZ0tp4OyocCEAoZRu-4YnjpwxeT0exBwfxZsCX"
                  />
                  <div className="program-overlay">
                    <span className="material-symbols-outlined">menu_book</span>
                  </div>
                </div>
                <div className="program-content">
                  <h3>Arts & Humanities</h3>
                  <p>
                    Our arts and humanities program nurtures creativity, critical thinking, and cultural awareness through literature, history, visual arts, and performing arts.
                  </p>
                  <div className="program-features">
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Visual & Performing Arts
                    </span>
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Literature & Writing
                    </span>
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      History & Social Studies
                    </span>
                  </div>
                  <Link to="/programs" className="program-link">
                    Learn More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>

              <div className="program-card">
                <div className="program-image-wrapper">
                  <img
                    alt="Applied Sciences"
                    className="program-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB4lVNQyIe80GjGtne6uU1dAU3pDsFasFSJiprZaSR4YFkMXlISVPk0qw8GzF3t8lI3Bjmn88_lBzbNFOy88Im6LTJPH5t2x9oeCn30irG9jOoANp8odToZv3lY8IPlNcIHreUZtR9-jTMeLUz1_9_KKEYHu7FYRJrbhDQzKRAHt_s8QndbO16Bj73KkXjf1SHWY1D5WtwX5VwTO5k-xVqInbnVcPb_NOeZaF2f3iHxDCuxIxp6Mp1kKN2mGLqczO8Tl01V-cvHCtT1"
                  />
                  <div className="program-overlay">
                    <span className="material-symbols-outlined">science</span>
                  </div>
                </div>
                <div className="program-content">
                  <h3>Languages & Communication</h3>
                  <p>
                    Our language program develops strong communication skills through comprehensive instruction in multiple languages, literature, and effective writing.
                  </p>
                  <div className="program-features">
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Multiple Languages
                    </span>
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Creative Writing
                    </span>
                    <span className="program-feature">
                      <span className="material-symbols-outlined">check_circle</span>
                      Public Speaking
                    </span>
                  </div>
                  <Link to="/programs" className="program-link">
                    Learn More
                    <span className="material-symbols-outlined">arrow_forward</span>
                  </Link>
                </div>
              </div>
            </div>
            <div className="programs-cta">
              <Link className="primary-btn primary-btn-lg" to="/programs">
                Explore Our Curriculum
              </Link>
            </div>
          </div>
        </section>

        
        

         
        {/* Join the Future CTA */}
        <section className="cta-section">
          <div className="cta-bg">
            <img
              alt="Futuristic Tech"
              className="cta-bg-image"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbpJZIFMTlPxbDcY4BcL4x8OctejjcDM_1xv0sX16_DZEJjpRPy6e9SX5xm7JCn8aZAWHXNPS4b878iw-ll1aFV5CPlubVvmC24kfFZu4FEpaZkOp2FRh4bg43DYPBM0Jqen8U1iqNLAohWbT7KlDBVFt8PpbgiwmDVJUKaBeLrfRIoualL--K--cSQGhGe0VFbEIo0mWLBw--PPjDBuk5mM3epPHalCBADLI_Nhe4cIwRotmVObNvcMDHI1V-Nmx5JrDnWnn80xBD"
            />
            <div className="cta-overlay"></div>
          </div>
          <div className="cta-content">
            <h2 className="cta-title">
              JOIN OUR <br />
              <span className="text-secondary">COMMUNITY</span>
            </h2>
            <p className="cta-description">
              Give your child the advantage of a world-class private education. Schedule a campus tour or apply for admission today.
            </p>
            <Link className="primary-btn primary-btn-lg primary-btn-neon" to="/admissions">
              Apply Now
            </Link>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo-container">
              <img
                src="https://res.cloudinary.com/dj6hpfbdr/image/upload/v1774652911/WhatsApp_Image_2026-03-27_at_8.38.37_AM_gi3o6b.jpg"
                alt="The Academy Logo"
                className="footer-logo-image"
              />
              <span className="logo-text">THE ACADEMY</span>
            </div>
            <p className="footer-copy">Nurturing Excellence, Building Character.</p>
          </div>
          <div className="footer-links-grid">
            <div className="footer-column">
              <h4>Portal</h4>
              <Link to="/signin">Student Login</Link>
              <Link to="/signin">Parent Portal</Link>
              <Link to="/signin">Faculty Access</Link>
            </div>
            <div className="footer-column">
              <h4>Connect</h4>
              <a href="#">X / Twitter</a>
              <a href="#">Instagram</a>
              <a href="#">LinkedIn</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 The Academy. All Rights Reserved.</p>
        </div>
      </footer>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container glass-card" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="modal-header">
              <h3>Inquiry & Admission</h3>
              <p>Please provide your details for a personalized response.</p>
            </div>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    name="fullName"
                    placeholder="Candidate's Name"
                    required
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Parent/Guardian Name</label>
                  <input
                    name="parentName"
                    placeholder="Full Name"
                    type="text"
                    value={formData.parentName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    name="email"
                    placeholder="email@example.com"
                    required
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Program of Interest</label>
                  <select
                    name="program"
                    required
                    value={formData.program}
                    onChange={handleInputChange}
                  >
                    <option value="">Select a program</option>
                    <option value="innovation">Innovation & Tech</option>
                    <option value="humanities">Classical Humanities</option>
                    <option value="science">Applied Sciences</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Current Qualification</label>
                  <input
                    name="qualification"
                    placeholder="Year/Level"
                    type="text"
                    value={formData.qualification}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="form-group full-width">
                <label>Personal Statement (Optional)</label>
                <textarea
                  name="statement"
                  placeholder="Tell us about your aspirations..."
                  rows="3"
                  value={formData.statement}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="form-checkbox">
                <input
                  id="termsAgree"
                  name="termsAgree"
                  required
                  type="checkbox"
                  checked={formData.termsAgree}
                  onChange={handleInputChange}
                />
                <label htmlFor="termsAgree">I agree to the privacy policy and data processing terms.</label>
              </div>
              <button className="primary-btn full-width" disabled={submitting} type="submit">
                {submitting ? 'Processing...' : 'Submit Inquiry'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default Home;
