import { Bell, Search, LogOut, User, Home, Github, Rocket, Settings, ScrollText, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useApi';
import { useUser } from '@/hooks/useApi';
import { useLocation } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const TopBar = () => {
  const { logout } = useAuth();
  const { data: user } = useUser();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  const getBreadcrumbs = () => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [
      { label: 'Dashboard', href: '/', icon: Home }
    ];

    if (segments.length > 0) {
      if (segments[0] === 'connect') {
        breadcrumbs.push({ label: 'Connect Repository', href: '/connect', icon: Github });
      } else if (segments[0] === 'projects') {
        breadcrumbs.push({ label: 'Projects', href: '/projects', icon: Home });
      } else if (segments[0] === 'deployments') {
        breadcrumbs.push({ label: 'Deployments', href: '/deployments', icon: Rocket });
      } else if (segments[0] === 'deploy') {
        breadcrumbs.push({ label: 'Deploy', href: '/deploy', icon: Rocket });
      } else if (segments[0] === 'settings') {
        breadcrumbs.push({ label: 'Settings', href: '/settings', icon: Settings });
      } else if (segments[0] === 'logs') {
        breadcrumbs.push({ label: 'Logs', href: '/logs', icon: ScrollText });
      } else if (segments[0] === 'result') {
        breadcrumbs.push({ label: 'Result', href: '/result', icon: CheckCircle });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex flex-1 items-center gap-4">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => (
              <div key={breadcrumb.href} className="flex items-center">
                {index > 0 && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage className="flex items-center gap-1">
                      {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href} className="flex items-center gap-1">
                      {breadcrumb.icon && <breadcrumb.icon className="h-4 w-4" />}
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user?.data?.username || 'User'}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
