'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, X } from 'lucide-react'
import { getMenuStructure, MenuModule } from '@/lib/permission-service'

interface Module {
  id: number
  name: string
  icon: string
  url: string
  permissions: number[]
  sub_module_info?: MenuModule[]
}

const iconMap: Record<string, React.ComponentType<any>> = {
  LayoutDashboard: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-3m0 0l7-4 7 4M5 9v10a1 1 0 001 1h12a1 1 0 001-1V9m-9 11l4-2m-9-2l4 2m0-5L9 7m4 0l4 2" /></svg>,
  MessageSquare: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
  Image: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  FolderOpen: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Lock: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v4h12z" /></svg>,
  Users: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-2.239" /></svg>,
  ActivitySquare: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  Settings: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  Plus: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>,
  Shield: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Key: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
}

const getIcon = (iconName: string) => {
  const IconComponent = iconMap[iconName]
  return IconComponent ? <IconComponent /> : null
}

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [modules, setModules] = useState<MenuModule[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    fetchMenuStructure()
    
    const handleMenuUpdate = () => {
      fetchMenuStructure()
    }
    
    window.addEventListener('menuUpdated', handleMenuUpdate)
    return () => window.removeEventListener('menuUpdated', handleMenuUpdate)
  }, [])

  const fetchMenuStructure = async () => {
    try {
      const menuFromStorage = localStorage.getItem('menu')
      if (menuFromStorage) {
        setModules(JSON.parse(menuFromStorage))
      } else {
        const roleIdCookie = document.cookie.split('; ').find(row => row.startsWith('roleId='))?.split('=')[1]
        const roleId = roleIdCookie || '17'
        const data = await getMenuStructure(roleId)
        setModules(data || [])
      }
    } catch (err) {
      console.error('Failed to load menu:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleSubMenu = (moduleId: number) => {
    setExpandedItems(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    )
  }

  const isActive = (url: string) => {
    return pathname === url || pathname.startsWith(url + '/')
  }

  if (loading) {
    return (
      <aside className="w-64 h-screen bg-gray-800 border-r border-gray-700 p-4">
        <div className="animate-pulse space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-700 rounded"></div>
          ))}
        </div>
      </aside>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 fixed lg:relative w-64 h-screen bg-gray-800 border-r border-gray-700 flex flex-col z-40 overflow-hidden`}
      >
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {modules.map((module, index) => {
            return (
              <div key={`module-${module.id}-${index}`}>
                {module.sub_module_info && module.sub_module_info.length > 0 ? (
                  <>
                    <button
                      onClick={() => toggleSubMenu(module.id)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                        isActive(module.url)
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getIcon(module.icon)}
                        <span className="font-medium">{module.name}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        className={`transition-transform ${
                          expandedItems.includes(module.id) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {expandedItems.includes(module.id) && (
                      <div className="pl-4 space-y-1 mt-1">
                        {module.sub_module_info.map((subModule, subIndex) => (
                          <Link
                            key={`submodule-${subModule.id}-${subIndex}`}
                            href={subModule.url}
                            className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                              isActive(subModule.url)
                                ? 'bg-blue-500 text-white'
                                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                            }`}
                          >
                            {getIcon(subModule.icon)}
                            <span>{subModule.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={module.url}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive(module.url)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {getIcon(module.icon)}
                    <span className="font-medium">{module.name}</span>
                  </Link>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
