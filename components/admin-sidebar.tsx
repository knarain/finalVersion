'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  MessageSquare,
  Image,
  FolderOpen,
  Settings,
  ChevronDown,
  Menu,
  X,
  Users,
  ActivitySquare,
  Lock
} from 'lucide-react'
import { getPermissionStructure } from '@/lib/permission-service'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  moduleSlug?: string
  subItems?: { label: string; href: string; moduleSlug?: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: <LayoutDashboard size={20} />
  },
  {
    label: 'Enquiries',
    href: '/admin/enquiries',
    icon: <MessageSquare size={20} />,
    moduleSlug: 'enquiries'
  },
  {
    label: 'Albums',
    href: '/admin/albums',
    icon: <Image size={20} />,
    moduleSlug: 'albums',
    subItems: [
      { label: 'All Albums', href: '/admin/albums' },
      { label: 'Create Album', href: '/admin/albums/create' }
    ]
  },
  {
    label: 'Categories',
    href: '/admin/categories',
    icon: <FolderOpen size={20} />,
    moduleSlug: 'categories',
    subItems: [
      { label: 'View Categories', href: '/admin/categories' },
      { label: 'Create Category', href: '/admin/categories/create' }
    ]
  },
  {
    label: 'Roles & Permissions',
    href: '/admin/roles',
    icon: <Lock size={20} />,
    moduleSlug: 'roles'
  },
  {
    label: 'User Management',
    href: '/admin/users',
    icon: <Users size={20} />,
    moduleSlug: 'users',
    subItems: [
      { label: 'User List', href: '/admin/users/list' },
      { label: 'User Roles', href: '/admin/users/roles' },
      { label: 'Access Privileges', href: '/admin/users/access' }
    ]
  },
  {
    label: 'Action Logs',
    href: '/admin/action-logs',
    icon: <ActivitySquare size={20} />,
    moduleSlug: 'logs'
  },
  {
    label: 'Settings',
    href: '/admin/settings',
    icon: <Settings size={20} />,
    moduleSlug: 'settings'
  }
]

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(true)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [visibleItems, setVisibleItems] = useState<NavItem[]>(navItems)
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()

  useEffect(() => {
    checkPermissions()
  }, [])

  const checkPermissions = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setLoading(false)
        setVisibleItems(navItems)
        return
      }

      const permData = await getPermissionStructure(token)
      
      // Get user's role from localStorage or make API call
      // For now, show all items if user has any permissions
      if (permData?.roles && permData?.assigned) {
        setVisibleItems(navItems)
      } else {
        // Show minimal items if no permissions
        setVisibleItems(navItems.filter(item => !item.moduleSlug))
      }
    } catch (err) {
      console.error('Failed to load permissions:', err)
      // Show all items by default even if permissions fail
      setVisibleItems(navItems)
    } finally {
      setLoading(false)
    }
  }

  const toggleSubMenu = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [label]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-800 text-white p-2 rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 transition-transform duration-300 fixed lg:relative w-64 h-screen bg-gray-800 border-r border-gray-700 flex flex-col z-40 overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-2 flex-1">
          {visibleItems.map(item => (
            <div key={item.label}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`transition-transform ${
                        expandedItems.includes(item.label) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {/* Submenus */}
                  {expandedItems.includes(item.label) && (
                    <div className="pl-4 space-y-1 mt-1">
                      {item.subItems.map(subItem => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-4 py-2 rounded-lg text-sm transition-colors ${
                            isActive(subItem.href)
                              ? 'bg-blue-500 text-white'
                              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                          }`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
