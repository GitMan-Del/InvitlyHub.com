"use client"

/* eslint-disable @next/next/no-img-element */
import { motion } from "framer-motion"
import Navbar from "@/components/navbar"
import {
  LayoutDashboard,
  CalendarHeart,
  PencilLine,
  LineChart,
  Send,
  Palette,
  ShieldCheck,
  Bell,
  Users,
} from "lucide-react"
import { Footer } from "@/components/footer"
import { useEffect, useState } from "react"

export default function Home() {
  // State to track viewport size for responsive adjustments
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024)
    }

    // Set initial values
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Clean up
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="h-fit w-full bg-black overflow-x-hidden">
      <div className="w-full md:h-screen h-[100svh] pointer-events-auto relative flex flex-col justify-center items-center bg-gradient-to-b from-0% to-100% from-black to-[#010102]">
        <Navbar />
        <motion.img
          src="/Circles/Bacкground.svg"
          alt="Circles"
          animate={{ rotate: 360 }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            duration: 20,
            ease: "linear",
          }}
          className="absolute top-1/5 w-full h-full object-fill"
          loading="lazy"
        />

        <div className="absolute w-[500px] h-[300px] blur-[120px] bg-[#622A9A]"></div>

        <motion.div
          className="absolute top-1/3 flex flex-col items-center justify-center text-center px-4 h-full z-10"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.div
            className="mb-6"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <span className="bg-black/80 text-[#9855FF] text-sm font-medium p-4 rounded-full inline-block">
              <span className="py-1 px-2 bg-[#9855FF] rounded-full text-black font-semibold">15%</span> To all plans.
              Don't miss this opportunity!
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold leading-tight mb-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.5 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#B372CF]">
              Create, Send, and Track
              <br />
            </span>
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-[#B372CF]">
              Beautiful Invitations Effortlessly
            </span>
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.3, delay: 0.8 }}
          >
            Invitify makes it easy to design invitations for any event and track your guest responses in real-time.
            Celebrate smarter.
          </motion.p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-black hover:cursor-pointer font-semibold py-3 px-6 rounded-full hover:bg-gray-200 transition"
          >
            Start for free
          </motion.button>

          <motion.div
            className="w-full h-fit z-30 flex mt-10 items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 1.2 }}
          >
            <img
              className="w-[90%] max-w-[1200px] object-contain rounded-xl"
              src="/App.png"
              alt="Preview"
              style={{
                boxShadow:
                  "0 6px 50px rgba(152, 85, 255, 0.5), 0 -4px 15px rgba(152, 85, 255, 0.2), 0 0 20px rgba(152, 85, 255, 0.1)",
              }}
              loading="lazy"
            />
          </motion.div>
        </motion.div>

        <div className="relative flex items-center justify-center w-full h-full">
          <div className="absolute bottom-0 w-[90%] h-[200px] blur-[200px] bg-[#622A9A]"></div>
        </div>
      </div>

      <section className="bg-black w-full h-[60vh]">
        <div className="relative flex items-center justify-center w-full h-full">
          <div className="absolute bottom-0 w-full h-[400px] z-10 bg-gradient-to-t from-black to-transparent from-30% to-100%"></div>
        </div>
      </section>

      <section className="w-full flex flex-col items-center p-4 sm:p-10 justify-center bg-black">
        <h1 className="text-3xl sm:text-4xl md:text-3xl font-bold leading-tight text-white/70 mb-8 sm:mb-12 text-center bg-black">
          Trusted by the world's most innovative teams
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-black py-8 sm:py-12">
          {[
            "/Logo/acme 1.svg",
            "/Logo/Echo Valley.svg",
            "/Logo/Quantum.svg",
            "/Logo/Pulse.svg",
            "/Logo/Outside.svg",
            "/Logo/Apex.svg",
            "/Logo/Celestial.svg",
            "/Logo/2Twince.svg",
          ].map((logo, index) => (
            <div
              key={index}
              className="p-4 sm:p-6 rounded-lg flex items-center justify-center w-full sm:w-[235px] h-[80px] sm:h-[98px] border border-white/15"
            >
              <img src={logo || "/placeholder.svg"} alt={`Logo ${index + 1}`} className="h-8 sm:h-12" loading="lazy" />
            </div>
          ))}
        </div>
      </section>

      <section className="w-full flex items-center justify-center min-h-screen bg-gradient-to-br from-[#190D2E] to-[#020103] text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-8 sm:gap-16">
          <div className="w-full text-center">
            <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
              Everything You Need to
              <br className="hidden md:block" />
              Make Your Event Shine
            </h2>
          </div>

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 lg:gap-16">
            {[
              {
                icon: LayoutDashboard,
                title: "User-friendly dashboard",
                desc: "Manage all your invitations and events with an intuitive, easy-to-use dashboard.",
              },
              {
                icon: CalendarHeart,
                title: "Multi-Event Support",
                desc: "Perfect for parties, birthdays, weddings, clubs, meet-ups, and more.",
              },
              {
                icon: PencilLine,
                title: "Easy Invitation Builder",
                desc: "Create stunning invitations in just minutes with simple drag-and-drop tools.",
              },
              {
                icon: LineChart,
                title: "Visual reports",
                desc: "Track opens, responses, and guest activity instantly.",
              },
              {
                icon: Send,
                title: "Instant Delivery",
                desc: "Send invitations via email or direct link with instant notifications.",
              },
              {
                icon: Palette,
                title: "Customizable Templates",
                desc: "Choose from a wide range of templates or design your own.",
              },
              {
                icon: ShieldCheck,
                title: "Secure and Private",
                desc: "Your data and guests' information stay fully protected.",
              },
              {
                icon: Bell,
                title: "Automated alerts",
                desc: "Automatic notifications about your Events, create and manage notifications.",
              },
              {
                icon: Users,
                title: "Guest List Management",
                desc: "Easily manage RSVPs, updates, and send reminders.",
              },
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-4">
                <feature.icon className="w-8 h-8 text-purple-400 flex-shrink-0" />
                <div>
                  <h3 className="text-xl sm:text-2xl mb-2 sm:mb-4 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section className="w-full relative py-16 md:py-24 text-white bg-black" aria-labelledby="pricing-heading">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-12 md:mb-16">
            <h2
              id="pricing-heading"
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
            >
              Pricing
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-3xl mx-auto">
              Choose the perfect plan to create, send, and track your invitations with ease. Whether you're hosting a
              small party or managing large events, we have a plan for you.
            </p>
          </div>

          {/* Decorative Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-[300px] sm:w-[500px] md:w-[700px] h-[300px] md:h-[500px] 
                        blur-[120px] bg-[#622A9A] opacity-30 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              aria-hidden="true"
            ></div>
          </div>

          {/* Pricing Cards Container */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto">
            {/* FREE Plan */}
            <div className="pricing-card group">
              <div className="h-full flex flex-col p-6 sm:p-8 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/15 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl sm:text-3xl font-bold">FREE</h3>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10">Get Started</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-bold">$0</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    Perfect for individuals just getting started with event planning.
                  </p>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    "Up to 3 events per month",
                    "Basic invitation templates",
                    "Email invitations",
                    "RSVP tracking",
                    "Basic analytics",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-purple-400 mr-2">✓</span>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#3D3D3D]/40 to-[#3D3D3D]/60 
                            border border-white/10 text-white font-medium transition-all duration-300
                            hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30
                            focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Join waitlist for Free plan"
                >
                  Join waitlist
                </button>
              </div>
            </div>

            {/* STANDARD Plan - Featured */}
            <div className="pricing-card featured relative z-20 transform md:-translate-y-4">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 to-transparent rounded-2xl blur-xl opacity-70"></div>
              <div className="h-full flex flex-col p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#000000] from-29% to-100% to-transparent border border-purple-500/30 relative z-10 shadow-xl shadow-purple-500/10">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-600 to-purple-400 text-black font-bold text-xs py-1 px-4 rounded-full">
                  MOST POPULAR
                </div>

                <img
                  className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none opacity-30"
                  src="/Pattern.svg"
                  alt="Pattern background"
                  loading="lazy"
                  aria-hidden="true"
                />

                <div className="mb-6 relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl sm:text-3xl font-bold">STANDARD</h3>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-500/20">Best Value</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-bold">$5</span>
                    <span className="text-gray-400 ml-2">/month</span>
                  </div>
                  <p className="text-gray-300 text-sm mb-6">Ideal for regular event planners and small businesses.</p>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6"></div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    "Unlimited events",
                    "Premium invitation templates",
                    "Email and SMS invitations",
                    "Advanced RSVP tracking",
                    "Detailed analytics",
                    "Custom branding",
                    "Priority support",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-purple-400 mr-2">✓</span>
                      <span className="text-sm text-white">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-purple-600 to-purple-500 
                            text-white font-medium transition-all duration-300
                            hover:shadow-lg hover:shadow-purple-500/30 hover:from-purple-500 hover:to-purple-600
                            focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Join waitlist for Standard plan"
                >
                  Join waitlist
                </button>
              </div>
            </div>

            {/* BUSINESS Plan */}
            <div className="pricing-card group">
              <div className="h-full flex flex-col p-6 sm:p-8 rounded-2xl bg-black/20 backdrop-blur-2xl border border-white/15 transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10">
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl sm:text-3xl font-bold">BUSINESS</h3>
                    <span className="px-3 py-1 text-xs font-medium rounded-full bg-white/10">Enterprise</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-3xl sm:text-4xl font-bold">Custom</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-6">
                    For organizations with advanced needs and large-scale events.
                  </p>
                </div>

                <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent mb-6"></div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {[
                    "Everything in Standard",
                    "White-label solution",
                    "API access",
                    "Multi-user accounts",
                    "Advanced security features",
                    "Custom integrations",
                    "Dedicated account manager",
                    "24/7 priority support",
                  ].map((feature, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-purple-400 mr-2">✓</span>
                      <span className="text-sm text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#3D3D3D]/40 to-[#3D3D3D]/60 
                            border border-white/10 text-white font-medium transition-all duration-300
                            hover:shadow-lg hover:shadow-purple-500/10 hover:border-purple-500/30
                            focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-2 focus:ring-offset-black"
                  aria-label="Contact sales for Business plan"
                >
                  Contact sales
                </button>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-12 text-center">
            <p className="text-gray-400 text-sm">
              All plans include a 7-day free trial. No credit card required to start.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                <span className="text-sm text-gray-300">24/7 Support</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                <span className="text-sm text-gray-300">99.9% Uptime</span>
              </div>
              <div className="flex items-center">
                <span className="w-4 h-4 rounded-full bg-purple-500 mr-2"></span>
                <span className="text-sm text-gray-300">Cancel Anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="flex p-6 sm:p-20 relative flex-col items-center justify-center w-full h-fit z-30 bg-black">
        <div className="absolute w-[300px] sm:w-[500px] h-[200px] sm:h-[300px] blur-[120px] bg-[#622A9A] z-1"></div>
        <div className="space-y-6 sm:space-y-10 w-[95%] sm:w-[90%] h-auto sm:h-[50vh] z-10 border border-white/15 rounded-2xl p-6 sm:p-10 bg-gradient-to-b from-transparent from-0% to-100% to-black backdrop-blur-3xl flex flex-col items-center justify-center">
          <img
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            src="/pattern1.svg"
            alt="Pattern background"
            loading="lazy"
          />

          <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-bold text-center leading-tight">
            Smart Invitations for <br className="hidden md:block" /> Every Occasion.
          </h1>

          <div className="relative flex items-center justify-center w-full max-w-[300px] sm:max-w-[400px]">
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 sm:px-5 py-2 sm:py-3 rounded-full border border-white/20 bg-transparent text-white placeholder-white/50 focus:outline-none"
            />
            <button className="absolute right-0 items-center mr-2 bg-white text-black font-semibold py-1 sm:py-2 px-3 sm:px-5 rounded-full hover:bg-gray-200 transition-all text-sm sm:text-base">
              Join waitlist
            </button>
          </div>

          <p className="text-center text-gray-400 text-xs sm:text-sm">
            No credit card required &bull; 7-days free trial
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
