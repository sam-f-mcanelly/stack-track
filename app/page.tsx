import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}

// To revert to the original landing page:
// 1. Remove the redirect above
// 2. Uncomment and restore the original LandingPage component below
// 3. Update the necessary imports

// "use client"
// import Link from "next/link"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import type React from "react"
// import { useAuth } from "@/contexts/AuthContext"

// export default function LandingPage() {
//   const { user } = useAuth()
//   return (
//     <div className="flex flex-col min-h-screen">
//       <header className="px-4 lg:px-6 h-14 flex items-center">
//         <Link className="flex items-center justify-center" href="/">
//           <MountainIcon className="h-6 w-6" />
//           <span className="ml-2 text-2xl font-bold">CryptoSummit</span>
//         </Link>
//         <nav className="ml-auto flex gap-4 sm:gap-6">
//           <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
//             Features
//           </Link>
//           <Link className="text-sm font-medium hover:underline underline-offset-4" href="#pricing">
//             Pricing
//           </Link>
//           {user ? (
//             <Link className="text-sm font-medium hover:underline underline-offset-4" href="/dashboard">
//               Dashboard
//             </Link>
//           ) : (
//             <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
//               Login
//             </Link>
//           )}
//         </nav>
//       </header>
//       <main className="flex-1">
//         <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
//           <div className="container px-4 md:px-6">
//             <div className="flex flex-col items-center space-y-4 text-center">
//               <div className="space-y-2">
//                 <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
//                   Welcome to Stack Track
//                 </h1>
//                 <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
//                   Your all-in-one solution for tracking cryptocurrency transactions and simplifying tax reporting.
//                 </p>
//               </div>
//               <div className="space-x-4">
//                 <Link href="/dashboard">
//                   <Button>Get Started</Button>
//                 </Link>
//                 <Link href="#features">
//                   <Button variant="outline">Learn More</Button>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </section>
//         <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
//           <div className="container px-4 md:px-6">
//             <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Key Features</h2>
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Transaction Tracking</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   Easily log and monitor all your cryptocurrency transactions across multiple exchanges and wallets.
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Tax Reporting</CardTitle>
//                 </CardHeader>
//                 <CardContent>Generate comprehensive reports for accurate and hassle-free tax filing.</CardContent>
//               </Card>
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Portfolio Analytics</CardTitle>
//                 </CardHeader>
//                 <CardContent>
//                   Gain insights into your cryptocurrency portfolio performance with detailed analytics and charts.
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>
//         <section id="pricing" className="w-full py-12 md:py-24 lg:py-32">
//           <div className="container px-4 md:px-6">
//             <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Pricing Plans</h2>
//             <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 lg:gap-12">
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Basic</CardTitle>
//                   <CardDescription>For individual investors</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-2">
//                     <li>Transaction tracking</li>
//                     <li>Basic tax reports</li>
//                     <li>Portfolio overview</li>
//                   </ul>
//                   <Button className="mt-4 w-full">Start Free</Button>
//                 </CardContent>
//               </Card>
//               <Card>
//                 <CardHeader>
//                   <CardTitle>Pro</CardTitle>
//                   <CardDescription>For serious traders and professionals</CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <ul className="space-y-2">
//                     <li>Advanced transaction tracking</li>
//                     <li>Comprehensive tax reports</li>
//                     <li>Intuit integration</li>
//                     <li>Exchange API integrations</li>
//                     <li>Priority support</li>
//                   </ul>
//                   <Button className="mt-4 w-full">Upgrade to Pro</Button>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//         </section>
//       </main>
//       <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
//         <p className="text-xs text-gray-500 dark:text-gray-400">© 2023 CryptoSummit. All rights reserved.</p>
//         <nav className="sm:ml-auto flex gap-4 sm:gap-6">
//           <Link className="text-xs hover:underline underline-offset-4" href="#">
//             Terms of Service
//           </Link>
//           <Link className="text-xs hover:underline underline-offset-4" href="#">
//             Privacy
//           </Link>
//         </nav>
//       </footer>
//     </div>
//   )
// }

// function MountainIcon(props: React.SVGProps<SVGSVGElement>) {
//   return (
//     <svg
//       {...props}
//       xmlns="http://www.w3.org/2000/svg"
//       width="24"
//       height="24"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
//     </svg>
//   )
// }
