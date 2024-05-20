import { AppProps } from 'next/app';
import '../styles/globals.css';
import { AuthContextProvider, WebSocketProvider } from '../modules';

export default function App({ Component, pageProps }: AppProps) {
    return (
        <>
            <AuthContextProvider>
                <WebSocketProvider>
                    <div className='flex flex-col md:flex-row h-full min-h-screen font-sans'>
                        <Component {...pageProps} />
                    </div>
                </WebSocketProvider>
            </AuthContextProvider>
        </>
    )
}
