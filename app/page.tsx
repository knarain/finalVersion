import { Navigation } from "@/components/navigation"
import { Gallery } from "@/components/gallery"
import { PackagesGrid } from "@/components/packages-grid"
import { ContactForm } from "@/components/contact-form"
import { BackToTop } from "@/components/back-to-top"
import { ScrollProgress } from "@/components/scroll-progress"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollProgress />
      <Navigation />

      {/* Hero Section */}
      <section id="home" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with improved loading */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-[20s] ease-out hover:scale-110"
          style={{
            backgroundImage: `url('/aerial-view-of-couple-walking-on-beach-with-golden.png')`,
          }}
        >
          <div className="absolute inset-0 bg-gray-900 animate-pulse"></div>
        </div>

        {/* Sophisticated Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 z-10"></div>

        {/* Vignette Effect */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/40 z-10"></div>

        {/* Hero Content with improved mobile responsiveness */}
        <div className="relative z-20 text-center max-w-5xl mx-auto px-4 sm:px-6">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-bold mb-4 sm:mb-6 text-balance leading-tight animate-fade-in-up">
            <span className="block text-white drop-shadow-2xl">Capturing</span>
            <span className="block text-amber-400 drop-shadow-2xl">Happiness..</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl md:text-3xl lg:text-4xl text-gray-200 mb-8 sm:mb-12 text-balance font-light tracking-wide drop-shadow-lg animate-fade-in-up animation-delay-300">
            Love Stories Told Here
          </p>

          {/* Decorative Line */}
          <div className="w-16 sm:w-24 h-1 bg-amber-400 mx-auto mb-8 sm:mb-12 rounded-full animate-fade-in-up animation-delay-600"></div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center animate-fade-in-up animation-delay-900">
            <a
              href="#gallery"
              className="group bg-amber-400 text-black px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-amber-300 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                View Gallery
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
            <a
              href="#contact"
              className="group border-2 border-white text-white px-8 sm:px-10 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-white hover:text-black transition-all duration-300 transform hover:scale-105 hover:shadow-2xl backdrop-blur-sm w-full sm:w-auto"
            >
              <span className="flex items-center justify-center gap-2">
                Get In Touch
                <svg
                  className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </span>
            </a>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="space-y-8">
            {/* Bio Content - Full Width */}
            <div className="space-y-6">
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                  <span className="text-amber-400">Hi</span> I am <span className="text-white">Rohan</span>
                </h2>
                <div className="w-16 h-1 bg-amber-400 rounded-full mb-8"></div>
              </div>
              <div className="space-y-4 sm:space-y-6 text-gray-300 leading-relaxed">
                <p className="text-base sm:text-lg">
                  I'm a passionate photographer based in Hyderabad, India, driven by an endless fascination with light, emotion, and human stories. 
                  Through my lens, I seek to capture not just moments—but the essence of people, places, and experiences that make them timeless. 
                  Every photograph is an opportunity to turn everyday life into a piece of art that resonates long after it’s seen.
                </p>
                <p className="text-base sm:text-lg">
                  Established in 2014, Rashmi Photography began as a personal creative pursuit and has since blossomed into a full-fledged photography studio. 
                  Our team combines artistic vision with technical precision, blending backgrounds in software engineering and visual storytelling to craft images that speak volumes. 
                  From intimate portraits to large-scale events, our work focuses on authenticity, emotion, and elegance—creating memories that last a lifetime.
                </p>
                <p className="text-base sm:text-lg">
                  At Rashmi Photography, every frame tells a story. Whether capturing the laughter of a family, the beauty of a wedding, or the energy of a city street—we aim 
                  to preserve the soul behind every scene. Based in Hyderabad, we continue to redefine the art of photography with creativity, compassion, and commitment.
                </p>
              </div>


              {/* Stats or Highlights */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 sm:pt-12 border-t border-gray-700">
                <div className="text-center py-4 sm:py-6">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-400 mb-2">500+</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold">Weddings</div>
                </div>
                <div className="text-center py-4 sm:py-6">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-400 mb-2">12+</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold">Years Experience</div>
                </div>
                <div className="text-center py-4 sm:py-6">
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-amber-400 mb-2">1000+</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide font-semibold">Happy Clients</div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="pt-6">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2 bg-amber-400 text-black px-6 sm:px-8 py-3 rounded-full font-semibold hover:bg-amber-300 transition-all duration-300 transform hover:scale-105"
                >
                  Let's Work Together
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 sm:py-20 px-4 bg-black">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">My</span> <span className="text-amber-400">Gallery</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-amber-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto text-balance">
              Explore a curated collection of my finest work, from intimate wedding moments to breathtaking landscapes
            </p>
          </div>

          {/* Gallery Component */}
          <Gallery />
        </div>
      </section>

      {/* Packages Section */}
      <section id="packages" className="py-16 sm:py-20 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Photography</span> <span className="text-amber-400">Packages</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-amber-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto text-balance">
              Choose the perfect package for your special moments
            </p>
          </div>

          {/* Packages Carousel */}
          <PackagesGrid />
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-white">Let's Start Your</span> <span className="text-amber-400">Journey</span>
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-amber-400 mx-auto mb-6 rounded-full"></div>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto text-balance">
              Ready to capture your special moments?</p>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto text-balance">Get in touch and let's create something beautiful together.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">Get In Touch</h3>
                <div className="space-y-6">
                  {/* Phone */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Call or WhatsApp</p>
                      <p className="text-white font-medium"><a href="tel:+919705997571">+91 9705 997 571</a></p>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium break-all">contactus@rashmiphotography.com</p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Based in</p>
                      <p className="text-white font-medium">Hyderabad-Bengaluru, India</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Follow My Work</h4>
                <div className="flex gap-4">
                  <a
                    href="https://youtube.com/@rashmiphotography?si=AaUCRFkec7PewHUG"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow on YouTube"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184C21.403 3.64 22.5 5.3 22.5 7.5v9c0 2.2-1.097 3.86-2.885 4.316C17.68 21.5 12 21.5 12 21.5s-5.68 0-7.615-.684C2.597 20.36 1.5 18.7 1.5 16.5v-9c0-2.2 1.097-3.86 2.885-4.316C6.32 2.5 12 2.5 12 2.5s5.68 0 7.615.684zM10 8.5v7l6-3.5-6-3.5z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.facebook.com/share/19j5FHKjvb/?mibextid=wwXIfr"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow on Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.675 0h-21.35C.595 0 0 .595 0 1.325v21.351C0 23.406.595 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.31h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.406 24 22.676V1.325C24 .595 23.406 0 22.675 0z" />
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/rashmiphotographyofficial?igsh=dWZ3MTRxZDVmYncz"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow on Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-4.358-.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.949 0 3.205.013 3.583.07 4.849.149 3.227 1.664 4.771 4.919 4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.013 3.668.07 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                   <a
                    href="https://whatsapp.com/channel/0029Vb47gNW0gcfI1DfXZl09"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow on WhatsApp"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.1-.472-.149-.67.15-.198.297-.768.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.67-1.611-.916-2.206-.242-.579-.487-.5-.67-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.002c-1.77 0-3.507-.448-5.04-1.296l-.361-.214-3.741.982.998-3.648-.235-.374a8.86 8.86 0 0 1-1.364-4.717c.001-4.927 4.011-8.936 8.94-8.936 2.387 0 4.632.933 6.318 2.619a8.83 8.83 0 0 1 2.624 6.311c-.003 4.926-4.013 8.935-8.937 8.935M20.52 3.484A11.815 11.815 0 0 0 11.997 0C5.372 0 .155 5.216.152 11.841c0 2.086.547 4.126 1.588 5.935L0 24l6.356-1.654a11.81 11.81 0 0 0 5.634 1.436h.005c6.624 0 11.841-5.216 11.844-11.84a11.76 11.76 0 0 0-3.319-8.458z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-gray-800 p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-white mb-2">Quick Response</h4>
                <p className="text-gray-300 text-sm">
                  I typically respond to inquiries within 24 hours. For urgent requests, feel free to call or WhatsApp
                  directly.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gray-800 p-6 sm:p-8 rounded-2xl">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-6">Send a Message</h3>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-8 sm:py-12 px-4 border-t border-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="relative">
              <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <div className="absolute -bottom-1 left-0 right-0 h-1 bg-amber-400 rounded-full"></div>
            </div>
            <span className="text-2xl font-bold text-white">Rashmi Photography</span>
          </div>
          <p className="text-gray-400 mb-4">Capturing Happiness, one frame at a time.</p>
          <p className="text-gray-500 text-sm">© 2025 Rashmi Photography. All rights reserved.</p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <BackToTop />
    </div>
  )
}
