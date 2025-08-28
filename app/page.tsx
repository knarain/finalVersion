import { Navigation } from "@/components/navigation"
import { Gallery } from "@/components/gallery"
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
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Portrait Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="/professional-photographer-portrait-by-bridge-water.png"
                  alt="Rohan - Professional Photographer"
                  className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-2 sm:-top-4 -right-2 sm:-right-4 w-16 sm:w-24 h-16 sm:h-24 border-4 border-amber-400 rounded-full opacity-20"></div>
              <div className="absolute -bottom-2 sm:-bottom-4 -left-2 sm:-left-4 w-12 sm:w-16 h-12 sm:h-16 bg-amber-400 rounded-full opacity-30"></div>
            </div>

            {/* Bio Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                  <span className="text-amber-400">Hi</span> I am <span className="text-white">Rohan</span>
                </h2>
                <div className="w-16 h-1 bg-amber-400 rounded-full mb-8"></div>
              </div>

              <div className="space-y-4 sm:space-y-6 text-gray-300 leading-relaxed">
                <p className="text-base sm:text-lg">
                  I am a passionate photographer based in Hyderabad, India. Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Praesent nec leo libero. Ut blandit lorem non magna volutpat, vitae tempor lorem
                  venenatis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis
                  egestas.
                </p>
                <p className="text-base sm:text-lg">
                   Founded in 2014, Rashmi Photography was born out of pure passion and a shared love for storytelling through images. What started as a creative pursuit has now grown into a dedicated team of professionals with backgrounds in software engineering and an unshakable commitment to the art of photography.
                </p>
              </div>

              {/* Stats or Highlights */}
              <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-6 sm:pt-8 border-t border-gray-700">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">500+</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Weddings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">12+</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-amber-400 mb-2">1000+</div>
                  <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">Happy Clients</div>
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
              Ready to capture your special moments? Get in touch and let's create something beautiful together.
            </p>
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
                      <p className="text-white font-medium">+91 9705 997 571</p>
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
                    href="#"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow on Twitter"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow on Pinterest"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z" />
                    </svg>
                  </a>
                  <a
                    href="#"
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center hover:bg-amber-400 hover:text-black transition-all duration-300 transform hover:scale-110"
                    aria-label="Follow on Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-4.358-.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.949 0 3.205.013 3.583.07 4.849.149 3.227 1.664 4.771 4.919 4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.013 3.668.07 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
