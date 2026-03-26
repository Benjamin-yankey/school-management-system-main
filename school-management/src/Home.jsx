import React,{ useState, useEffect, useRef } from 'react';
import './Home.css';

const Home = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
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
    { label: 'Home', href: '#', active: true },
    { label: 'Programs', href: '#', active: false },
    { label: 'Campus', href: '#', active: false },
    { label: 'Admissions', href: '#', active: false },
  ];

  const stats = [
    { value: '98', suffix: '%', label: 'Graduate Placement', description: 'Securing positions within Fortune 500 companies and elite research labs within 6 months.' },
    { value: 'Top 1', suffix: '%', label: 'Research Output', description: 'Globally recognized contributions to Artificial Intelligence, Bio-Engineering, and FinTech.' },
    { value: '50', suffix: '+', label: 'Global Partnerships', description: 'Collaborative academic ventures with Ivy League and leading technological institutes.' },
  ];

  const galleryItems = [
    { title: 'High-tech Labs', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDSYA_9sHZey0gDZ1pwIzP8CCrWurKkz5uA0M2KqB-R_eCdFmG4oWa6iszC9loatt0I3V67RnQWxTeOS_MzQYx15Td9Wh2-AOiTgT9zQksPV0penjQoLUitNE7S15euPJzj-F-JdeyX1K0ojK8VSk1XyFuBKltMJGLoYfwh9wgpzw-cb7KxvGYSHpujNlTlcaYTrMAa-MpWDEvYpCFjFrw7cqya5VnQf8g1GOtTiGrUI9uofP1rYQ3-sBk_IV5r3j-O8VNLnO_2cuUn' },
    { title: 'Rooftop Libraries', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACSzuFHnTguXDCIp70SzHgIEFHEo1UzytA8X6bbRrKH5Ey7KyAFZkddiVQ48P4_4gMwWG6f7mQfB1sTxqmZn_4zl7C89qBwb8Bw5uV7l5N4PSlr1zw1f8AsTrXPzlfjeygK3dMVcQdHhBISfQDZSgojl_naILx_haB2fGNjFi1jBkS5-f5PHOhGvbeCKPkGZZd5TuT0-TmaikvpIn-9XPtqgxGXZ9RQSoDke-sYOQZ0tp4OyocCEAoZRu-4YnjpwxeT0exBwfxZsCX' },
    { title: 'Creative Studios', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4lVNQyIe80GjGtne6uU1dAU3pDsFasFSJiprZaSR4YFkMXlISVPk0qw8GzF3t8lI3Bjmn88_lBzbNFOy88Im6LTJPH5t2x9oeCn30irG9jOoANp8odToZv3lY8IPlNcIHreUZtR9-jTMeLUz1_9_KKEYHu7FYRJrbhDQzKRAHt_s8QndbO16Bj73KkXjf1SHWY1D5WtwX5VwTO5k-xVqInbnVcPb_NOeZaF2f3iHxDCuxIxp6Mp1kKN2mGLqczO8Tl01V-cvHCtT1' },
    { title: 'Collaboration Zones', image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHGAPYDx_2R8yALjbiA-GexxRVhGp0MY_oavvUaqA5HAnqz8ux7HsbBG9fJ6NpEyMVwjMuKdh71qnmhB3uiaANV-fhKNoKKBY6MMr-mEhzD57Yqq7RUAHgFGeSPerdKHnoqe7ajizxbVIveho9BsygsODuNGrzrj3F8tznERDw5C4PBeoahBp51Emkvd5cKiX8Vf63Pf7rMWQG2dtYnjGZGM7DoaAEuy_xCfoBl8P-Slj7iGjsjfkbJMvmECQzGEun8Q3QMqVDOihX' },
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
      const navbar = document.querySelector('.navbar');
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
    if (!formData.phone || formData.phone.length < 10) {
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
    if (!formData.qualification) {
      showToast('Please select your highest qualification.', 'error');
      return;
    }
    if (!formData.statement) {
      showToast('Please write your personal statement.', 'error');
      return;
    }
    if (!formData.termsAgree) {
      showToast('Please agree to the terms and conditions.', 'error');
      return;
    }

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
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="logo-text">THE ACADEMY</span>
          <div className="navbar-links">

        
            {navLinks.map((link, index) => (
              <a
                key={index}
                className={link.active ? 'nav-link active' : 'nav-link'}
                href={link.href}
              >
                {link.label}
              </a>
            ))}

<div className="nav-actions">
          <div className="nav-icons">
            <span className="material-symbols-outlined icon-btn">notifications</span>
            <span className="material-symbols-outlined icon-btn">account_circle</span>
          </div>
          <button className="primary-btn" onClick={openModal}>
            Apply Now
          </button>
        </div>




          </div>
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
            <span className="hero-badge">Enrollment Open</span>
            <h1 className="hero-title">
              The Future of <br />
              <span className="gradient-text">Academic Excellence</span>
            </h1>
            <p className="hero-description">
              Step into a sanctuary designed for the next generation of thinkers, creators, and innovators. Where tradition meets hyper-modernity.
            </p>
            <div className="hero-buttons">
              <button className="primary-btn primary-btn-lg" onClick={openModal}>
                Apply for 2024
              </button>
              <button className="secondary-btn secondary-btn-lg">
                Explore Curriculum
              </button>
            </div>
          </div>
        </section>

        {/* Stats Grid */}
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-value">
                {stat.value}<span className="stat-suffix">{stat.suffix}</span>
              </div>
              <p className="stat-label">{stat.label}</p>
              <p className="stat-description">{stat.description}</p>
            </div>
          ))}
        </div>


        
 
        {/* Mission & Vision Section */}
        <section className="mission-section">
          <div className="blur-circle blur-circle-top"></div>
          <div className="blur-circle blur-circle-bottom"></div>
          <div className="mission-container">
            <div className="mission-grid">
              <div className="mission-card glass-card group">
                <div className="icon-box">
                  <span className="material-symbols-outlined filled-icon">visibility</span>
                </div>
                <h3 className="card-title">A Global Standard in Elite Education</h3>
                <p className="card-text">
                  We envision a world where education transcends traditional boundaries, integrating high-stakes technology with the timeless pursuit of human wisdom. Our vision is to define the global benchmark for excellence.
                </p>
                <div className="card-link">
                  <span>Learn about our Roadmap</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
              <div className="image-card">
                <img
                  alt="Modern architecture of a high-tech university campus"
                  className="image-card-img"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBqZqo6ZO1gdzYs8Wrtov6l1ksBZDjOFkQE7cikar9jtVmk_baybE5Udf5tFWBBalaSWj2oKSFBZi8u-LrtLA1owgNzaRulbPW_JD4X8yUGe95pMtRCh99UdUf3mRQJBdcDYsebp-IQrPusOjOSKvq6VbhcOcmdCZ2mpMKBhGwqBX0jC0B06_l8QzQDbms_ZCw1Tb87aPQWkPnl3hH5NZn2aPfrnTQV5EVdP7kpMKWiBw7fMEuc-lpGq997pQ3zclnxn2Gh3jw7vkcY"
                />
                <div className="image-card-overlay"></div>
                <div className="image-card-content">
                  <h3 className="image-card-title">The Sanctuary Campus</h3>
                  <p className="image-card-subtitle">Zurich, Switzerland</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Academic Excellence Bento Grid */}
        <section className="bento-section">
          <div className="bento-grid">
            <div className="bento-card bento-card-large glass-card">
              <div className="bento-card-icon">
                <span className="material-symbols-outlined">biotech</span>
              </div>
              <div className="bento-card-content">
                <h3 className="bento-card-title">Deep Focus Research</h3>
                <p className="bento-card-text">Our laboratories provide an environment for undisturbed cognitive breakthroughs in quantum computing and bio-ethics.</p>
              </div>
            </div>
            <div className="bento-card bento-card-small">
              <span className="material-symbols-outlined filled-icon text-primary">public</span>
              <h3 className="bento-card-title">Global Innovation Hub</h3>
              <p className="bento-card-text">Connecting our scholars with 40+ international partners and industry giants.</p>
            </div>
            <div className="bento-card bento-card-medium">
              <span className="material-symbols-outlined text-secondary text-3xl">psychology</span>
              <div>
                <h3 className="bento-card-title">AI-Driven Curriculum</h3>
                <p className="bento-card-text">Personalized learning paths powered by state-of-the-art neural engines.</p>
              </div>
            </div>
            <div className="bento-card bento-card-wide glass-card">
              <div className="bento-card-image-wrapper">
                <img
                  alt="Technology Lab"
                  className="bento-card-image"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwE7rqJKqQBK31VMlWu4EixeDfxp4pClYVTi52xxr-n0sPPZfV2xoi09t1cFahzHPcdoDl9gC3xMI0-PmDv8jHeTkGs2uKZEBTDMQ1CR3pJ2o-w-9DrpztZ1h0Q_NNISMhDsGLMt1GzY7s2D4yGFD4zFQlrULXgzFP7_i3U6jE59IetJEM1uHxmJSo3pCIjBxCrYJ18A0OK2cdtUTYeM5BPKQX0goC3qsuCy2fv29uxisw4oDr6PS54_2Yiw7ZxKdZhuh5XOo07QXw"
                />
              </div>
              <div className="bento-card-text-wrapper">
                <h3 className="bento-card-title">Robotics & Synergy</h3>
                <p className="bento-card-text">Exploring the frontier of human-machine interaction in our dedicated robotics wing.</p>
              </div>
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
                <div className="year-badge-value">1924</div>
                <div className="year-badge-label">The Foundation</div>
              </div>
            </div>
            <div className="legacy-content">
              <h2 className="section-title">The Evolution of Excellence</h2>
              <p className="section-text">
                What began a century ago as a quiet sanctuary for classical scholars has been fundamentally re-engineered for the digital frontier. We have preserved the sanctity of deep thought while integrating the boundless potential of the metaverse and neural-link research.
              </p>
              <p className="section-text">
                Today, The Academy stands as a "Neon Sanctuary"—a place where silence is respected, but innovation is constant. We don't just teach history; we provide the tools to write the next chapter of human civilization.
              </p>
              <div className="legacy-link-wrapper">
                <a className="text-link" href="#">
                  Read the Full Manifesto
                  <span className="material-symbols-outlined">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Campus Life Gallery */}
        <section className="gallery-section">
          <div className="gallery-header">
            <div>
              <h2 className="section-title-lg">Campus Life</h2>
              <p className="section-subtitle">A sanctuary for the soul and the mind.</p>
            </div>
            <div className="gallery-nav">
              <button className="nav-btn" onClick={() => scrollGallery('left')}>
                <span className="material-symbols-outlined">arrow_back</span>
              </button>
              <button className="nav-btn" onClick={() => scrollGallery('right')}>
                <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
          <div ref={galleryRef} className="gallery-scroll">
            {galleryItems.map((item, index) => (
              <div key={index} className="gallery-item">
                <img alt={item.title} className="gallery-item-image" src={item.image} />
                <div className="gallery-item-overlay"></div>
                <div className="gallery-item-content">
                  <h4 className="gallery-item-title">{item.title}</h4>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Event Calendar */}
        <section className="events-section">
          <div className="events-container">
            <div className="events-header">
              <div>
                <h2 className="section-title-lg">Upcoming Calendar</h2>
                <p className="section-subtitle">Curated explorations for the inquisitive mind.</p>
              </div>
              <div className="filter-tabs">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    className={`filter-btn ${activeFilter === filter ? 'filter-btn-active' : ''}`}
                    onClick={() => handleFilterClick(filter)}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="events-grid">
              {filteredEvents.map((event, index) => (
                <div key={index} className="event-card" data-category={event.category}>
                  <div className="event-inner">
                    <div className="event-image-wrapper">
                      <img alt={event.title} className="event-image" src={event.image} />
                      <div className={`event-badge event-badge-${event.category}`}>
                        {event.category}
                      </div>
                    </div>
                    <div className="event-content">
                      <div className="event-header">
                        <div>
                          <h3 className="event-title">{event.title}</h3>
                          <p className="event-description">{event.description}</p>
                        </div>
                        <div className="event-date">
                          <div className="event-date-value">{event.date}</div>
                          <div className="event-date-month">{event.month}</div>
                        </div>
                      </div>
                      <div className="event-footer">
                        <span className="event-time">
                          <span className="material-symbols-outlined">schedule</span>
                          {event.time}
                        </span>
                        <button className="add-btn">
                          Add to Calendar
                          <span className="material-symbols-outlined">add</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Elite Faculty Row */}
        <section className="faculty-section">
          <div className="faculty-header">
            <h2 className="section-title-lg">Visionary Minds</h2>
            <p className="section-subtitle">Guided by world-class curators and leading educators.</p>
          </div>
          <div className="faculty-grid">
            {faculty.map((member, index) => (
              <div key={index} className="faculty-card">
                <div className="faculty-image-wrapper">
                  <img alt={member.name} className="faculty-image" src={member.image} />
                </div>
                <h4 className="faculty-name">{member.name}</h4>
                <p className="faculty-role">{member.role}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Achievement Timeline Bento */}
        <section className="achievement-section">
          <div className="achievement-container">
            <div className="achievement-grid">
              <div className="achievement-card achievement-card-large glass-card">
                <div className="achievement-bg">
                  <img
                    alt="Academic award ceremony"
                    className="achievement-image"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw1xWgPoTWt10PdUPju8YdEo3pJG54vbGBC8pw7-jzDJqe_fyU79BPmI1FzS-kBv47aMwzxr9g3uOzgQAT5CbA3bbYNp6j3cKXz1lx0x1_EOF6GdC9eg9AXMT374QQR9XVunbMl0hcdbTCZKtzO5uarPEiY0PX0IfdTJ-JPyY6cjBr1_zY6qSjAWVWGJ2sFTPvshLOvXw5QxVuqL617R3C0-W349dW5l45EjpBBiZNuoOJLxg9aHCwE46yXMc-_SUYBtHTehGbskiu"
                  />
                </div>
                <div className="achievement-content">
                  <span className="achievement-label">Major Milestone</span>
                  <h3 className="achievement-title">Voted #1 Private Academy for Technological Integration</h3>
                  <p className="achievement-text">Three consecutive years of global leadership in education tech.</p>
                </div>
              </div>
              <div className="achievement-card achievement-card-medium">
                <div className="achievement-icon-wrapper">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <div>
                  <h4 className="achievement-subtitle">Patent Hub</h4>
                  <p className="achievement-description">Over 120 patents filed by students and faculty in 2023 alone.</p>
                </div>
              </div>
              <div className="achievement-card achievement-card-small">
                <h4 className="achievement-stat">10k+</h4>
                <p className="achievement-stat-label">Alumni Network</p>
              </div>
              <div className="achievement-card achievement-card-cta">
                <h4 className="achievement-cta-title">Join the Elite</h4>
                <p className="achievement-cta-text">Admissions for 2025 are now open for select candidates.</p>
                <span className="material-symbols-outlined">arrow_outward</span>
              </div>
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
              READY TO ENTER THE <br />
              <span className="text-secondary">SANCTUARY?</span>
            </h2>
            <p className="cta-description">
              The next evolution of academic brilliance starts here. Secure your place in the most innovative community on the planet.
            </p>
            <button className="primary-btn primary-btn-lg primary-btn-neon" onClick={openModal}>
              Apply for 2024 Intake
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-header">
            <span className="footer-logo">THE ACADEMY</span>
            <div className="footer-links">
              <a className="footer-link" href="#">Privacy Policy</a>
              <a className="footer-link" href="#">Terms of Service</a>
              <a className="footer-link" href="#">Contact Us</a>
              <a className="footer-link" href="#">Careers</a>
            </div>
          </div>
          <div className="footer-divider"></div>
          <div className="footer-footer">
            <p className="footer-copyright">© 2024 The Academy at The Sanctuary. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Admission Form Modal */}
      <div className={`modal ${modalOpen ? 'modal-open' : ''}`}>
        <div className="modal-backdrop" onClick={closeModal}></div>
        <div className="modal-content">
          <div className="modal-header">
            <button className="modal-close" onClick={closeModal}>
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="modal-header-content">
              <span className="material-symbols-outlined text-secondary text-3xl">school</span>
              <h3 className="modal-title">The Academy Admissions</h3>
            </div>
            <p className="modal-subtitle">Begin your journey to academic excellence</p>
          </div>
          
          <div className="modal-body">
            <form className="admission-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">badge</span>
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  className="form-input"
                  placeholder="Johnathan M. Sterling"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">badge</span>
                  Parent/Guardian Name
                </label>
                <input
                  type="text"
                  name="parentName"
                  className="form-input"
                  placeholder="Johnathan M. Sterling"
                  value={formData.parentName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">mail</span>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="applicant@theacademy.edu"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">call</span>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">call</span>
                  Parent/Guardian Phone
                </label>
                <input
                  type="tel"
                  name="parentPhone"
                  className="form-input"
                  placeholder="+1 (555) 000-0000"
                  value={formData.parentPhone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">cake</span>
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dob"
                  className="form-input"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">menu_book</span>
                  Program of Interest
                </label>
                <select
                  name="program"
                  className="form-input form-select"
                  value={formData.program}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select a program</option>
                  <option value="ai-ml">Artificial Intelligence & Machine Learning</option>
                  <option value="quantum">Quantum Computing</option>
                  <option value="bioengineering">Bio-Engineering & Ethics</option>
                  <option value="fintech">FinTech & Digital Economics</option>
                  <option value="creative-tech">Creative Technology & Design</option>
                  <option value="leadership">Global Leadership & Innovation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">history_edu</span>
                  Highest Qualification
                </label>
                <select
                  name="qualification"
                  className="form-input form-select"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>Select qualification</option>
                  <option value="highschool">High School Diploma</option>
                  <option value="bachelor">Bachelor's Degree</option>
                  <option value="master">Master's Degree</option>
                  <option value="phd">PhD / Doctorate</option>
                  <option value="other">Other / Equivalent</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">description</span>
                  Personal Statement / Motivation
                </label>
                <textarea
                  name="statement"
                  className="form-input form-textarea"
                  rows="4"
                  placeholder="Tell us why you want to join The Academy and what drives your passion for innovation..."
                  value={formData.statement}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label className="form-label">
                  <span className="material-symbols-outlined text-secondary">share</span>
                  How did you hear about us?
                </label>
                <select
                  name="referral"
                  className="form-input form-select"
                  value={formData.referral}
                  onChange={handleInputChange}
                >
                  <option value="" disabled>Select an option</option>
                  <option value="social">Social Media</option>
                  <option value="alumni">Alumni Referral</option>
                  <option value="event">Educational Event</option>
                  <option value="search">Search Engine</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-checkbox-group">
                <input
                  type="checkbox"
                  name="termsAgree"
                  id="termsAgree"
                  className="form-checkbox"
                  checked={formData.termsAgree}
                  onChange={handleInputChange}
                  required
                />
                <label htmlFor="termsAgree" className="form-checkbox-label">
                  I confirm that the information provided is accurate and I agree to the 
                  <a href="#" className="text-secondary">Terms of Admission</a> and 
                  <a href="#" className="text-secondary">Privacy Policy</a>.
                </label>
              </div>

              <button type="submit" className="submit-btn" disabled={submitting}>
                <span className="material-symbols-outlined">send</span>
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>

            <div className="form-notice">
              <span className="material-symbols-outlined text-secondary">info</span>
              <p>
                Your application will be reviewed by our admissions committee. You will receive a confirmation email within 48 hours. 
                <span className="text-secondary"> Early decision deadline: December 15, 2024</span>
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <p className="modal-footer-text">
              <span className="material-symbols-outlined">security</span> Secure submission
            </p>
            <p className="modal-footer-text">⭐ The Academy Admissions 2024</p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Home;
