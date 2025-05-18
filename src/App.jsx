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
    return saved
      ? JSON.parse(saved)
      : {
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
  const [respondentId, setRespondentId] = useState(null);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (direction === 'next') {
      if (activeIndex === categories.length + 1) {
        handleSubmit();
      } else if (activeIndex < categories.length + 2) {
        swiperInstance.slideNext();
      }
    }

    if (direction === 'prev' && activeIndex > 0 && !isThankYouPage) {
      swiperInstance.slidePrev();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitStatus('submitting');

      const { data: respondentData, error: respondentError } = await supabase
        .from('respondents')
        .insert([formData])
        .select();

      if (respondentError) throw respondentError;

      const newRespondentId = respondentData[0].id;
      setRespondentId(newRespondentId);

      const answersToSubmit = [];

      categories.forEach(category => {
        const categoryAnswers = answers[category.name] || {};

        category.questions.forEach(question => {
          const response = categoryAnswers[question.text];

          if (response) {
            const responseValue = ['Sangat Kurang Baik', 'Kurang Baik', 'Baik', 'Sangat Baik'].indexOf(response) + 1;
            answersToSubmit.push({
              respondent_id: newRespondentId,
              question_id: question.id,
              response: responseValue
            });
          }
        });
      });

      const { error: answersError } = await supabase
        .from('answers')
        .insert(answersToSubmit);

      if (answersError) throw answersError;

      localStorage.removeItem('formData');
      localStorage.removeItem('answers');

      setSubmitStatus('success');

      setTimeout(() => {
        if (swiperInstance) {
          swiperInstance.slideTo(categories.length + 2);
          setActiveIndex(categories.length + 2);
        }
      }, 50);
    } catch (error) {
      console.error('Error submitting data:', error);
      setSubmitStatus('error');
    }
  };

  // These index calculations need to properly account for the intro page
  const isIntroPage = activeIndex === 0;
  const isIdentityPage = activeIndex === 1;
  const isQuestionPage = activeIndex >= 2 && activeIndex < categories.length + 2;
  const isLastQuestionPage = activeIndex === categories.length + 1;
  const isSubmitPage = activeIndex === categories.length + 1;
  const isThankYouPage = activeIndex === categories.length + 2;

  const isCurrentSlideComplete = () => {
    if (activeIndex === 0) return true; // Intro page is always complete
    if (activeIndex === 1) return isIdentityValid;
    if (activeIndex === categories.length + 2) return true;

    if (activeIndex >= 2 && activeIndex < categories.length + 2) {
      const currentCategory = categories[activeIndex - 2];
      if (!currentCategory) return false;
      
      const answered = answers[currentCategory.name] || {};
      return currentCategory.questions.every(question => answered[question.text]);
    }
    
    return true;
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
        {!isThankYouPage && (
          <div className="text-center mb-8">
            <img src="/logo_lppm.png" alt="UT Logo" className="mx-auto h-16 md:h-20 mb-4 object-contain" />
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-1">Survey Kepuasan Mahasiswa</h1>
          </div>
        )}
        
        {isQuestionPage && (
          <ProgressIndicator 
            activeIndex={activeIndex - 2} 
            total={categories.length} 
          />
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
            const oldIndex = activeIndex;

            // Always scroll after slide changes — works for both swipe and button click
            setTimeout(() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 10); // slight delay ensures DOM is updated

            // Prevent access to thank you page if not submitted
            if (oldIndex === categories.length + 1 && newIndex === categories.length + 2 && submitStatus !== 'success') {
              swiper.slideTo(oldIndex, 0);
              return;
            }

            // Prevent swiping back from thank you page
            if (oldIndex === categories.length + 2 && newIndex !== categories.length + 2) {
              swiper.slideTo(oldIndex, 0);
              return;
            }

            // Validation check for incomplete slides
            if (!isCurrentSlideComplete()) {
              swiper.slideTo(oldIndex, 0);
            } else {
              setActiveIndex(newIndex);
            }
          }}
        >
          {/* Intro Page */}
          <SwiperSlide>
            <div className="p-4 md:p-6">
              <div className="text-center mb-6">
                <div className="bg-blue-50 p-8 rounded-2xl border-l-4 border-blue-500 shadow-md">
                  <h2 className="text-2xl font-bold text-blue-800 mb-6">Kepada Yth. Mahasiswa Universitas Terbuka</h2>
                  
                  <div className="space-y-4 text-left">
                    <p className="text-gray-700 leading-relaxed">
                      Universitas Terbuka sedang melakukan survei kepuasan terhadap pelayanan Universitas Terbuka kepada mahasiswa. Tujuan dari survei ini adalah untuk mengetahui tingkat kepuasan dan kemudahan pada pelayanan belajar di Universitas Terbuka.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Mohon partisipasi Anda untuk mengisi survei ini. Terdapat 4 (empat) pilihan jawaban yang disediakan untuk setiap pernyataan. Pilihlah salah satu jawaban yang paling sesuai dengan pengalaman Anda. Semua identitas responden akan dirahasiakan.
                    </p>
                    
                    <p className="text-gray-700 leading-relaxed">
                      Partisipasi Anda sangat membantu pengembangan Universitas Terbuka menjadi lebih baik.
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-blue-200">
                    <p className="text-gray-700 font-medium">Terima kasih.</p>
                    <p className="text-blue-700 font-bold text-lg mt-1">UNIVERSITAS TERBUKA</p>
                  </div>

                  <div className="mt-10 flex justify-center">
                    <button 
                      onClick={() => handleNavigation('next')}
                      className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium flex items-center gap-2 group"
                    >
                      Mulai Survey
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>

          {/* Identity Form */}
          <SwiperSlide>
            <div className="p-4 md:p-6">
              <IdentitasForm
                formData={formData}
                handleChange={handleChange}
                onValidationChange={setIsIdentityValid}
              />
            </div>
          </SwiperSlide>

          {/* Questions */}
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

          {/* Submit Page */}
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
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-10 rounded-2xl border border-blue-100 shadow-lg w-full max-w-md">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5h14l-4.5 8.5L14 19H10l3-6H5" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="text-3xl font-bold text-blue-800 mb-3">Terima Kasih!</h2>
                    
                    <div className="bg-white px-6 py-4 rounded-xl shadow-inner border border-blue-50 mb-6">
                      <p className="text-blue-600 font-medium">
                        Data Anda telah berhasil direkam dengan ID:
                      </p>
                      <p className="text-blue-800 font-bold text-lg">
                        {respondentId ? `#${respondentId}` : 'Tersimpan'}
                      </p>
                    </div>
                    
                    <p className="text-gray-700">
                      Partisipasi Anda dalam survei ini sangat berarti bagi kami. Masukan Anda akan digunakan untuk meningkatkan kualitas layanan Universitas Terbuka.
                    </p>
                    
                    <div className="mt-6 pt-4 border-t border-blue-100">
                      <p className="text-blue-700 font-bold">UNIVERSITAS TERBUKA</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </SwiperSlide>
        </Swiper>

        {!isThankYouPage && !isIntroPage && (
          <NavigationButtons
            activeIndex={isIdentityPage ? 0 : activeIndex - 2}
            maxIndex={categories.length}
            handleNavigation={handleNavigation}
            disableNext={!isCurrentSlideComplete() || submitStatus === 'submitting'}
          />
        )}
      </div>
    </div>
  );
};

export default App;