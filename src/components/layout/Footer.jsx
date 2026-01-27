import { Instagram, Facebook } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-background-alt text-text-muted border-t border-border/20 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

                    {/* Logo Brand */}
                    <div className="flex flex-col items-center md:items-start space-y-4">
                        <div className="flex flex-col">
                            <span className="font-serif text-xl tracking-widest text-text-primary">PERLA</span>
                            <span className="font-serif text-xl tracking-widest text-text-primary -mt-1">NEGRA</span>
                        </div>
                        <p className="text-sm max-w-xs">
                            Piacere, cura e discrezione. <br />
                            Benessere intimo, con rispetto.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="flex flex-col space-y-2 items-center">
                        <h3 className="text-text-primary font-medium mb-2">Links</h3>
                        <a href="/termini" className="text-sm hover:text-accent transition-colors">Termini e condizioni</a>
                        <a href="/privacy" className="text-sm hover:text-accent transition-colors">Privacy policy</a>
                        <a href="/uso" className="text-sm hover:text-accent transition-colors">Uso responsabile</a>
                        <a href="/adulto" className="text-sm hover:text-accent transition-colors">+18 | Uso adulto</a>
                    </div>

                    {/* Social / Contact */}
                    <div className="flex flex-col items-center md:items-end space-y-4">
                        <div className="flex space-x-4">
                            <a href="https://www.instagram.com/perlanegra.it?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="p-2 bg-background-dark rounded-full hover:text-accent hover:border-accent border border-transparent transition-all" aria-label="Visita il nostro Instagram">
                                <Instagram size={20} />
                            </a>
                            <a href="https://www.facebook.com/profile.php?id=61580952122579&rdid=KF3E80I7TNmdrcd4&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1C3Cp1Ayiw%2F" target="_blank" rel="noopener noreferrer" className="p-2 bg-background-dark rounded-full hover:text-accent hover:border-accent border border-transparent transition-all" aria-label="Visita il nostro Facebook">
                                <Facebook size={20} />
                            </a>
                        </div>
                        <p className="text-xs">
                            &copy; {new Date().getFullYear()} Perla Negra. Tutti i diritti riservati.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
