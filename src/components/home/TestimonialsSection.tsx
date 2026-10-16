import React from 'react'
import Image from 'next/image'
import { SectionHeader } from '@/components/ui/SectionHeader'

const TESTIMONIALS = [
  {
    id: 'raneem',
    name: 'رنيم',
    text: 'El mawke3 da top el top',
    avatar: '/assets/avatars/avatar_raneem.jpg',
    isRtl: false,
  },
  {
    id: 'malak',
    name: 'ملك',
    text: 'قدرت اتعرف على طلاب ساعدوني اني اطور مهاراتي واتسفدت جدا جدا',
    avatar: '/assets/avatars/avatar_malak.jpg',
    isRtl: true,
  },
  {
    id: 'mohamed',
    name: 'محمد',
    text: 'قدرت اشارك مع طلاب تانين زي جابر، وعملنا احلى مشروع يدخلنا السجن 😂',
    avatar: '/assets/avatars/avatar_mohamed.jpg',
    isRtl: true,
  }
]

export function TestimonialsSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="section-container">
        <SectionHeader title="What students say" subtitle="Real experiences from our community" />
        
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TESTIMONIALS.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-bg-cream rounded-3xl p-6 md:p-8 flex flex-col border border-orange-50 shadow-sm transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                  <Image 
                    src={testimonial.avatar} 
                    alt={`Avatar of ${testimonial.name}`} 
                    fill 
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-text-primary text-lg" dir="rtl">{testimonial.name}</h4>
                  <div className="flex gap-1 text-brand-orange mt-1">
                    {'★★★★★'.split('').map((star, i) => <span key={i} className="text-sm md:text-base">{star}</span>)}
                  </div>
                </div>
              </div>
              <p 
                className="text-text-body text-base md:text-lg leading-relaxed flex-1 italic" 
                dir={testimonial.isRtl ? 'rtl' : 'ltr'}
              >
                &quot;{testimonial.text}&quot;
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
