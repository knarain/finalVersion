'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PermissionGuardProps {
  moduleId: number;
  children: React.ReactNode;
}

export default function PermissionGuard({ moduleId, children }: PermissionGuardProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const roleId = localStorage.getItem('roleId');
        const token = localStorage.getItem('adminToken');

        if (!roleId || !token) {
          router.push('/login');
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/permissions/check-permission`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
              'X-Role-ID': roleId,
            },
            body: JSON.stringify({
              role_id: roleId,
              module_id: moduleId,
              permission_id: 1,
            }),
          }
        );

        if (response.status === 403) {
          setHasPermission(false);
        } else if (response.ok) {
          const data = await response.json();
          setHasPermission(data.results?.has_permission ?? true);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        console.error('Permission check failed:', err);
        setHasPermission(false);
      }
    };

    checkPermission();
  }, [moduleId, router]);

  if (hasPermission === null) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Access Denied</h1>
          <p className="text-xl text-gray-300 mb-8">You do not have permission</p>
          <button
            onClick={() => router.push('/admin')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
