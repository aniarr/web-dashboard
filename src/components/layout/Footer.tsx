import { Activity, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t py-12 mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground">
                <Activity className="w-3 h-3" />
              </div>
              <span className="font-bold text-lg text-foreground">Mr DocGen</span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-4">
              The premier professional reporting tool for modern SaaS teams. Generate insights faster with our intelligent automation platform.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">A product of</span>
              <a 
                href="https://inovuslabs.org/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline flex items-center gap-1"
              >
                Inovus Labs IEDC
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Mr DocGen. All rights reserved.</p>
          <p className="mt-2 md:mt-0">
            Powered by <a href="https://inovuslabs.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Inovus Labs IEDC</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
