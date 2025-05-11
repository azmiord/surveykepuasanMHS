import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import { EffectCoverflow } from 'swiper/modules';
import CategoryQuestions from './components/CategoryQuestions';
import IdentitasForm from './components/IdentitasForm';
import ProgressIndicator from './components/ProgressIndicator';
import NavigationButtons from './components/NavigationButtons';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const App = () => {
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('formData');
    return saved ? JSON.parse(saved) : {
      nama: '', nim: '', fakultas: '', prodi: '', asal_ut: '',
      semester: '', email: '', no_hp: ''
    };
  });

  const [isIdentityValid, setIsIdentityValid] = useState(false);
  const [answers, setAnswers] = useState(() => {
    const saved = localStorage.getItem('answers');
    return saved ? JSON.parse(saved) : {};
  });

  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Fetch questions from Supabase
  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .order('category_order')
          .order('service_order');
          
        if (error) throw error;
        
        // Group questions by category
        const groupedCategories = [];
        const categoryMap = new Map();
        
        data.forEach(question => {
          if (!categoryMap.has(question.category_display_name)) {
            categoryMap.set(question.category_display_name, {
              name: question.category_display_name,
              order: question.category_order,
              questions: []
            });
            groupedCategories.push(categoryMap.get(question.category_display_name));
          }
          
          categoryMap.get(question.category_display_name).questions.push({
            id: question.id,
            text: question.service,
            order: question.service_order
          });
        });
        
        // Sort categories and questions by their order
        groupedCategories.sort((a, b) => a.order - b.order);
        groupedCategories.forEach(category => {
          category.questions.sort((a, b) => a.order - b.order);
        });
        
        setCategories(groupedCategories);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching questions:', error);
        setIsLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);

  useEffect(() => {
    localStorage.setItem('formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    localStorage.setItem('answers', JSON.stringify(answers));
  }, [answers]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAnswerChange = (category, question, value) => {
    setAnswers(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [question]: value
      }
    }));
  };

  const handleNavigation = (direction) => {
    if (direction === 'next') {
      if (activeIndex === categories.length) {
        // Handle submission
        handleSubmit();
      } else if (activeIndex < categories.length + 1) {
        swiperInstance.slideNext();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    if (direction === 'prev' && activeIndex > 0) {
      swiperInstance.slidePrev();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitStatus('submitting');
      
      // 1. Insert respondent data
      const { data: respondentData, error: respondentError } = await supabase
        .from('respondents')
        .insert([formData])
        .select();
        
      if (respondentError) throw respondentError;
      
      const respondentId = respondentData[0].id;
      
      // 2. Prepare answer data for submission
      const answersToSubmit = [];
      
      categories.forEach(category => {
        const categoryAnswers = answers[category.name] || {};
        
        category.questions.forEach(question => {
          const response = categoryAnswers[question.text];
          
          if (response) {
            // Map text responses to numbers (1-4)
            const responseValue = ['Sangat Kurang Baik', 'Kurang Baik', 'Baik', 'Sangat Baik']
              .indexOf(response) + 1;
              
            answersToSubmit.push({
              respondent_id: respondentId,
              question_id: question.id,
              response: responseValue
            });
          }
        });
      });
      
      // 3. Insert answers
      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToSubmit);
        
      if (answersError) throw answersError;
      
      // 4. Clear local storage after successful submission
      localStorage.removeItem('formData');
      localStorage.removeItem('answers');
      
      setSubmitStatus('success');
      swiperInstance.slideNext();
    } catch (error) {
      console.error('Error submitting data:', error);
      setSubmitStatus('error');
    }
  };

  const isIdentityPage = activeIndex === 0;
  const isSubmitPage = activeIndex === categories.length + 1;
  const isQuestionPage = activeIndex > 0 && activeIndex <= categories.length;

  const isCurrentSlideComplete = () => {
    if (activeIndex === 0) return isIdentityValid;
    if (activeIndex === categories.length + 1) return true;

    const currentCategory = categories[activeIndex - 1];
    const answered = answers[currentCategory.name] || {};
    return currentCategory.questions.every(question => answered[question.text]);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-indigo-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-600 text-lg">Memuat pertanyaan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-indigo-100 p-4 md:p-8 font-sans transition-all duration-500 ease-in-out">
      <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/70 border border-white/30 rounded-3xl p-6 md:p-10 shadow-xl">

        {isQuestionPage && (
          <ProgressIndicator activeIndex={activeIndex} total={categories.length} />
        )}

        {isIdentityPage && (
          <div className="text-center mb-8">
            <img src="ut-logo.png" alt="UT Logo" className="mx-auto w-20 h-20 md:w-24 md:h-24 mb-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-1">
              Survey Kepuasan Mahasiswa
            </h1>
            <p className="text-lg text-blue-600">Universitas Terbuka Indonesia</p>
          </div>
        )}

        <Swiper
          effect="coverflow"
          grabCursor={true}
          allowTouchMove={true}
          modules={[EffectCoverflow]}
          className="max-w-xl mx-auto swiper-container"
          coverflowEffect={{
            rotate: 30,
            stretch: 10,
            depth: 100,
            modifier: 1,
            slideShadows: false,
          }}
          onSwiper={setSwiperInstance}
          onSlideChange={(swiper) => {
            const newIndex = swiper.activeIndex;
            if (!isCurrentSlideComplete()) {
              swiper.slideTo(activeIndex);
            } else {
              setActiveIndex(newIndex);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <SwiperSlide>
            <div className="p-4 md:p-6">
              <IdentitasForm
                formData={formData}
                handleChange={handleChange}
                onValidationChange={setIsIdentityValid}
              />
            </div>
          </SwiperSlide>

          {categories.map((category, idx) => (
            <SwiperSlide key={idx}>
              <div className="p-4 md:p-6">
                <CategoryQuestions
                  category={category.name}
                  questions={category.questions.map(q => q.text)}
                  handleAnswerChange={handleAnswerChange}
                  currentAnswers={answers[category.name] || {}}
                />
              </div>
            </SwiperSlide>
          ))}

          <SwiperSlide>
            <div className="p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
              {submitStatus === 'submitting' ? (
                <>
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <h2 className="text-2xl font-bold text-blue-800 mb-3">Mengirim data...</h2>
                  <p className="text-blue-600">Mohon tunggu sebentar.</p>
                </>
              ) : submitStatus === 'error' ? (
                <>
                  <svg className="w-24 h-24 text-red-500 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <h2 className="text-3xl font-bold text-red-800 mb-3">Terjadi kesalahan!</h2>
                  <p className="text-red-600 mb-4">Mohon coba lagi nanti.</p>
                  <button 
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Coba Lagi
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-24 h-24 text-green-500 mb-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <h2 className="text-3xl font-bold text-blue-800 mb-3">Terima kasih!</h2>
                  <p className="text-blue-600 text-lg mb-4">Kami menghargai partisipasi Anda dalam survei ini.</p>
                  <p className="text-blue-500">Masukan Anda membantu kami meningkatkan layanan Universitas Terbuka.</p>
                </>
              )}
            </div>
          </SwiperSlide>
        </Swiper>

        <NavigationButtons
          activeIndex={activeIndex}
          maxIndex={categories.length}
          handleNavigation={handleNavigation}
          disableNext={!isCurrentSlideComplete() || submitStatus === 'submitting'}
        />

      </div>
    </div>
  );
};

export default App;