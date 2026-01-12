interface PageLayoutProps {
	title: string;
	subtitle?: string;
	children: React.ReactNode;
	action?: React.ReactNode;
}

function PageLayout({ title, subtitle, children, action }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-black -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">{title}</h1>
            {subtitle && <p className="text-slate-400 mt-1">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
        
        {children}
      </div>
    </div>
  );
}

export default PageLayout;
