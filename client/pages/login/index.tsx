import React, { SyntheticEvent, useContext, useEffect, useState } from 'react';
import { API_URL } from '../../constants';
import { useRouter } from 'next/router';
import { AuthContext, UserInfo } from '../../modules';

const Index = () => {
    const router = useRouter();
    const [inputs, setInputs] = useState({
        email: '',
        password: ''
    });
    const {isAuthenticated} = useContext(AuthContext);

    useEffect(() => {
      if (isAuthenticated) {
        router.push('/');
      }
    }, [isAuthenticated]);
    

    const handleLogin = async (e: SyntheticEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inputs)
            });

            const data = await res.json();

            if (res.ok) {
                const user: UserInfo ={
                    username: data.username,
                    id: data.id
                };
                localStorage.setItem('user_info', JSON.stringify(user));
                router.push('/');
            }


        } catch (error) {
            console.log(error);

        }

    }

    return (
        <div className='flex justify-center items-center min-w-full min-h-full'>
            <form className='flex flex-col md:w-1/5' onSubmit={handleLogin}>
                <div className='text-3xl font-bold text-center'>
                    <span className='text-blue'>Welcome!</span>
                </div>
                <input
                    type='text'
                    placeholder='email'
                    value={inputs.email}
                    onChange={(e) => setInputs({ ...inputs, email: e.target.value })}
                    className='p-3 mt-8 rounded-md border-2 border-grey focus:outline-none focus:border-blue' />
                <input
                    type='password'
                    placeholder='password'
                    value={inputs.password}
                    onChange={(e) => setInputs({ ...inputs, password: e.target.value })}
                    className='p-3 mt-4 rounded-md border-2 border-grey focus:outline-none focus:border-blue' />
                <button
                    type='submit'
                    onClick={handleLogin}
                    className='p-3 mt-6 bg-blue font-bold text-white rounded-md'
                >
                    Login
                </button>
            </form>
        </div>
    )
}

export default Index