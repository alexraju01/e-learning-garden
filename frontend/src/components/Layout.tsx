import { ReactNode, useState } from 'react'
import Footer from './Footer';
import Header from './Header';

interface LayoutProps {
    children?: React.ReactNode;
}

function Sidebar ( ){
    return(   <li
        //   onClick={() => setSelectedPage(page.key)}
          className='w-full text-left px-3 py-2 rounded-lg transition-colors'
        >
          workspace
        </li>
    )   
}

export default function Layout ({ children }: LayoutProps) {
    const [selectedPage, setSelectedPage] = useState ('dashboard')
    
    // const renderPageLinks = () => {
    // return pages.map(page => (
    //    <li
    //       key={page.key}
    //       onClick={() => setSelectedPage(page.key)}
    //       className='w-full text-left px-3 py-2 rounded-lg transition-colors'
    //     >
    //       {page.name}
    //     </li>
    //     ));
//   }
    
    return(
        <div className="min-h-screen flex flex-col">
            {/* header */}
            <header />

            {/* Sidebar */}
            <aside className="flex flex-1 pt-16">
                <ul>
                   <Sidebar />
                   <Sidebar />
                   <Sidebar />
                </ul>
            </aside>

            {/* maincontent */}
            <section className="flex-1 p-6">
                {children}
            </section>

            {/* Footer */}
            <Footer />
        </div>
    );
};

