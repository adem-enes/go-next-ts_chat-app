import { AppProps } from 'next/app';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <div className='flex flex-col md:flex-row h-full min-h-screen font-sans'>
                <Component {...pageProps} />
            </div>
        </>
    )
}
