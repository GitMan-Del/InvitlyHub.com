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

export default function Home() {
  return (
    <div className="h-fit w-full bg-black overflow-x-hidden">
      <div className="w-full h-screen pointer-events-auto relative flex flex-col justify-center items-center bg-gradient-to-b from-0% to-100%  from-black to-[#010102]">
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
            <span className="bg-black/80 text-[#9855FF] text-sm font-medium p-4 rounded-full">
              <span className="py-1 px-2 bg-[#9855FF] rounded-full text-black font-semibold">15%</span> To all plans.
              Don't miss this opportunity!
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-8xl font-bold leading-tight mb-4"
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
            className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl"
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
              className="w-[90%] object-contain rounded-xl"
              src="/App.png"
              alt="Preview"
              style={{
                boxShadow:
                  "0 6px 50px rgba(152, 85, 255, 0.5), 0 -4px 15px rgba(152, 85, 255, 0.2), 0 0 20px rgba(152, 85, 255, 0.1)",
              }}
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

      <section className="w-full flex flex-col items-center p-10  justify-center bg-black">
        <h1 className="text-4xl md:text-3xl font-bold leading-tight text-white/70 mb-12 text-center bg-black ">
          Trusted by the world's most innovative teams
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-black py-12">
          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px]  border border-white/15">
            <img src="/Logo/acme 1.svg" alt="Logo 1" className="h-12" />
          </div>

          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px]  border border-white/15">
            <img src="/Logo/Echo Valley.svg" alt="Logo 2" className="h-12" />
          </div>

          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px]  border border-white/15">
            <img src="/Logo/Quantum.svg" alt="Logo 3" className="h-12" />
          </div>

          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px]  border border-white/15">
            <img src="/Logo/Pulse.svg" alt="Logo 4" className="h-12" />
          </div>

          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px]  border border-white/15">
            <img src="/Logo/Outside.svg" alt="Logo 5" className="h-12" />
          </div>

          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px]  border border-white/15">
            <img src="/Logo/Apex.svg" alt="Logo 6" className="h-12" />
          </div>

          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px]  border border-white/15">
            <img src="/Logo/Celestial.svg" alt="Logo 7" className="h-12" />
          </div>

          <div className=" p-6 rounded-lg flex items-center justify-center w-[235px] h-[98px] border border-white/15">
            <img src="/Logo/2Twince.svg" alt="Logo 8" className="h-12" />
          </div>
        </div>
      </section>

      <section className="w-full flex items-center justify-center  min-h-screen bg-gradient-to-br from-[#190D2E] to-[#020103] text-white py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-16">
          <div className="w-full text-center lg:text-left">
            <h2 className="text-4xl md:text-7xl font-bold leading-tight">
              Everything You Need to
              <br />
              Make Your Event Shine
            </h2>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-30">
            <div className="flex items-start gap-4">
              <LayoutDashboard className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">User-friendly dashboard</h3>
                <p className="text-sm text-gray-300">
                  Manage all your invitations and events with an intuitive, easy-to-use dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <CalendarHeart className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Multi-Event Support</h3>
                <p className="text-sm text-gray-300">
                  Perfect for parties, birthdays, weddings, clubs, meet-ups, and more.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <PencilLine className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Easy Invitation Builder</h3>
                <p className="text-sm text-gray-300">
                  Create stunning invitations in just minutes with simple drag-and-drop tools.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <LineChart className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Visual reports</h3>
                <p className="text-sm text-gray-300">Track opens, responses, and guest activity instantly.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Send className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Instant Delivery</h3>
                <p className="text-sm text-gray-300">
                  Send invitations via email or direct link with instant notifications.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Palette className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Customizable Templates</h3>
                <p className="text-sm text-gray-300">Choose from a wide range of templates or design your own.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <ShieldCheck className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Secure and Private</h3>
                <p className="text-sm text-gray-300">Your data and guests&apos; information stay fully protected.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Bell className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Automated alerts</h3>
                <p className="text-sm text-gray-300">
                  Automatic notifications about your Events, create and manage notifications.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <h3 className="text-2xl mb-4 font-semibold">Guest List Management</h3>
                <p className="text-sm text-gray-300">Easily manage RSVPs, updates, and send reminders.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full relative h-screen gap-20 text-white bg-black flex flex-col items-center justify-center py-20">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold">Pricing</h1>
          <p className="text-gray-400 mt-2 max-w-[70%] mx-auto text-center">
            Choose the perfect plan to create, send, and track your invitations with ease. Whether you&apos;re hosting a
            small party or managing large events
          </p>
        </div>

        <div className="absolute w-[500px] h-[300px] blur-[120px] bg-[#622A9A]"></div>

        <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
          <div className="w-[250px] border border-white/15 h-[350px] flex justify-between p-6  rounded-2xl items-start bg-black/20 flex-col backdrop-blur-2xl">
            <div className="w-full flex flex-col items-start gap-4">
              <h1 className="text-3xl">FREE</h1>
              <p className="text-sm -mt-1">Free forever $0/mo</p>
              <div className="w-full h-[1px] bg-[#282729]"></div>

              <ul className="gap-5 flex flex-col text-sm">
                <li>✔️ Keyword optimization</li>
                <li>✔️ Automated meta tags</li>
                <li>✔️ Monitoring</li>
                <li>✔️ Monthly reports</li>
              </ul>
            </div>

            <button className="relative opacity-90 overflow-hidden rounded-3xl p-1 backdrop-blur-md bg-transparent hover:cursor-pointer w-full mt-6">
              <div
                className="relative flex items-center justify-center rounded-3xl bg-[#3D3D3D]/40 px-6 py-2 shadow-inner shadow-white/20"
                style={{
                  boxShadow: `
                  inset 0 1px 3px rgba(255,255,255,0.3),
                  inset 0 -1px 3px rgba(255,255,255,0.2),
                  inset 1px 0 3px rgba(255,255,255,0.2),
                  inset -1px 0 3px rgba(255,255,255,0.3)
                `,
                }}
              >
                <span className="text-white font-bold text-sm md:text-base">Join waitlist</span>
              </div>
            </button>
          </div>

          <div className="w-[250px] z-50 border scale-110 bg-gradient-to-b from-[#000000] from-29% to-100% to-transparent  border-white/15 h-[350px] flex justify-between p-6 rounded-2xl items-start bg-black/20 flex-col backdrop-blur-2xl relative">
            <img
              className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
              src="/Pattern.svg"
              alt="svg"
            />
            <div className="w-full flex flex-col items-start gap-4">
              <h1 className="text-3xl">STANDARD</h1>
              <p className="text-sm -mt-1">$5/mo</p>
              <div className="w-full h-[1px] bg-[#282729]"></div>

              <ul className="gap-5 flex flex-col text-sm mt-4">
                <li> ✔️Keyword optimization</li>
                <li>✔️ Automated meta tags</li>
                <li>✔️ Monitoring</li>
                <li>✔️ Monthly reports</li>
                <li>✔️ Content suggestions</li>
                <li>✔️ Link optimization</li>
              </ul>
            </div>

            <button className="relative opacity-90 overflow-hidden rounded-3xl p-1 backdrop-blur-md bg-transparent hover:cursor-pointer w-full mt-6">
              <div
                className="relative flex items-center justify-center rounded-3xl bg-[#3D3D3D]/40 px-6 py-2 shadow-inner shadow-white/20"
                style={{
                  boxShadow: `
                  inset 0 1px 3px rgba(255,255,255,0.3),
                  inset 0 -1px 3px rgba(255,255,255,0.2),
                  inset 1px 0 3px rgba(255,255,255,0.2),
                  inset -1px 0 3px rgba(255,255,255,0.3)
                `,
                }}
              >
                <span className="text-white font-bold text-sm md:text-base">Join waitlist</span>
              </div>
            </button>
          </div>

          <div className="w-[250px] border border-white/15 h-[350px] flex justify-between p-6  rounded-2xl items-start bg-black/20 flex-col  backdrop-blur-2xl">
            <div className="w-full flex flex-col items-start gap-4">
              <h1 className="text-3xl">BUSINESS</h1>
              <p className="text-sm -mt-1">Contact Sales</p>
              <div className="w-full h-[1px] bg-[#282729]"></div>

              <ul className="gap-5 flex flex-col text-sm">
                <li>✔️ Keyword optimization</li>
                <li>✔️ Automated meta tags</li>
                <li>✔️ Monitoring</li>
                <li>✔️ Monthly reports</li>
                <li>✔️ Content suggestions</li>
                <li>✔️ Link optimization</li>
                <li>✔️ Multi-user access</li>
                <li>✔️ API integration</li>
              </ul>
            </div>

            <button className="relative opacity-90 overflow-hidden rounded-3xl  p-1 backdrop-blur-md bg-transparent hover:cursor-pointer w-full mt-6">
              <div
                className="relative flex items-center justify-center rounded-3xl bg-[#3D3D3D]/40 px-6 py-2 shadow-inner shadow-white/20"
                style={{
                  boxShadow: `
                  inset 0 1px 3px rgba(255,255,255,0.3),
                  inset 0 -1px 3px rgba(255,255,255,0.2),
                  inset 1px 0 3px rgba(255,255,255,0.2),
                  inset -1px 0 3px rgba(255,255,255,0.3)
                `,
                }}
              >
                <span className="text-white font-bold text-sm md:text-base">Join waitlist</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="flex p-20 relative flex-col items-center justify-center w-full h-fit z-30 bg-black px-4">
        <div className="absolute w-[500px] h-[300px] blur-[120px] bg-[#622A9A] z-1"></div>
        <div className="space-y-10 w-[90%] h-[50vh] z-10 border border-white/15 rounded-2xl p-10 bg-gradient-to-b from-transparent from-0% to-100% to-black backdrop-blur-3xl flex flex-col items-center justify-center">
          <img
            className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
            src="/pattern1.svg"
            alt="svg2"
          />

          <h1 className="text-4xl md:text-8xl font-bold text-center leading-tight">
            Smart Invitations for <br className="hidden md:block" /> Every Occasion.
          </h1>

          <div className="relative flex items-center justify-center w-[200px]">
            <input
              type="email"
              placeholder="Your email"
              className="w-full max-w-md px-5 py-3 rounded-full border border-white/20 bg-transparent text-white placeholder-white/50 focus:outline-none"
            />
            <button className="absolute right-0 items-center mr-2 bg-white text-black font-semibold py-2 px-5 rounded-full hover:bg-gray-200 transition-all">
              Join waitlist
            </button>
          </div>

          <p className="text-center text-gray-400 text-sm">No credit card required &bull; 7-days free trial</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
