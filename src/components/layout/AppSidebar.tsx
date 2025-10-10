import { LayoutDashboard, Github, Rocket, ScrollText, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { name: 'Connect GitHub', icon: Github, href: '/connect' },
  { name: 'Deploy', icon: Rocket, href: '/deploy' },
  { name: 'Logs', icon: ScrollText, href: '/logs/demo' },
  { name: 'Settings', icon: Settings, href: '/settings' },
];

export const AppSidebar = () => {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <Rocket className="mr-2 h-6 w-6 text-primary" />
        <h1 className="text-lg font-bold">Smart Cloud Deploy</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>
      
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary" />
          <div className="flex-1">
            <p className="text-sm font-medium">Developer</p>
            <p className="text-xs text-muted-foreground">dev@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
