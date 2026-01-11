'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { X } from 'lucide-react'

interface Package {
  id: number
  category: string
  name: string
  price: number
  features: string[]
  is_active: boolean
}

interface GroupedPackage {
  name: string
  packages: Package[]
}

export function PackagesGrid() {
  const [groupedPackages, setGroupedPackages] = useState<GroupedPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)

  useEffect(() => {
    fetchPackages()
  }, [])

  const fetchPackages = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/packages`)
      const data = res.data.results?.data || []
      const parsed = data
        .filter((pkg: any) => pkg.is_active)
        .map((pkg: any) => ({
          ...pkg,
          features: typeof pkg.features === 'string' ? JSON.parse(pkg.features) : pkg.features
        }))
      
      const grouped = parsed.reduce((acc: GroupedPackage[], pkg: Package) => {
        const existing = acc.find(g => g.name === pkg.name)
        if (existing) {
          existing.packages.push(pkg)
        } else {
          acc.push({ name: pkg.name, packages: [pkg] })
        }
        return acc
      }, [])
      
      setGroupedPackages(grouped)
    } catch (err) {
      console.error('Failed to fetch packages:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="text-center text-gray-400">Loading packages...</div>

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-8 pb-8">
        {groupedPackages.map(group => (
          <div key={group.name} className="flex flex-col">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-black">{group.name}</h3>
            </div>
            <div className="space-y-2 bg-gray-800 rounded-b-xl p-4 border border-t-0 border-gray-700 flex-1">
              {group.packages.map(pkg => (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className="p-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-all duration-300 cursor-pointer border border-gray-600 hover:border-amber-400"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-lg font-semibold text-white truncate" title={pkg.category}>{pkg.category.length > 15 ? pkg.category.substring(0, 15) + '...' : pkg.category}</h4>
                    <span className="text-2xl font-bold text-amber-400">₹{pkg.price.toLocaleString()}</span>
                  </div>
                  <ul className="space-y-1">
                    {(Array.isArray(pkg.features) ? pkg.features : typeof pkg.features === 'string' ? JSON.parse(pkg.features) : [])
                      .slice(0, 2)
                      .map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300 text-sm">
                          <svg className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span>{feature}</span>
                        </li>
                      ))}
                  </ul>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      setSelectedPackage(pkg)
                    }}
                    className="mt-3 w-full bg-amber-400 text-black font-semibold py-2 rounded text-sm hover:bg-amber-300 transition-all duration-300"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-2xl w-full border border-gray-700">
            <div className="bg-gradient-to-r from-amber-400 to-amber-500 p-6 flex justify-between items-start">
              <div>
                <h3 className="text-3xl font-bold text-black">{selectedPackage.name}</h3>
                <p className="text-black/80 text-sm mt-1">{selectedPackage.category}</p>
                <div className="text-3xl font-bold text-black mt-3">₹{selectedPackage.price.toLocaleString()}</div>
              </div>
              <button
                onClick={() => setSelectedPackage(null)}
                className="text-black hover:bg-black/20 p-2 rounded-full transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="px-6 py-6">
              <h4 className="text-lg font-semibold text-white mb-4">All Features</h4>
              <ul className="space-y-3">
                {(Array.isArray(selectedPackage.features) ? selectedPackage.features : typeof selectedPackage.features === 'string' ? JSON.parse(selectedPackage.features) : []).map((feature: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                onClick={() => setSelectedPackage(null)}
                className="block w-full bg-amber-400 text-black font-semibold py-3 rounded-lg hover:bg-amber-300 transition-all duration-300 text-center mt-6"
              >
                Get This Package
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
