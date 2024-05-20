import React, { useContext, useEffect, useRef, useState } from 'react';
import { ChatBody } from '../../components';
import { AuthContext, WebSocketContext } from '../../modules';
import { useRouter } from 'next/router';
import { API_URL } from '../../constants';
import autosize from 'autosize';

export type Message = {
    content: string,
    clientId: string,
    username: string,
    roomId: string,
    type: 'recv' | 'self'
}

const Index = () => {
    const [messages, setMessages] = useState<Array<Message>>([]);
    const [users, setUsers] = useState<Array<{ username: string }>>([]);
    const textArea = useRef<HTMLTextAreaElement>(null);
    const { conn } = useContext(WebSocketContext);
    const { user } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => { //Get Clients in the room
        if (conn === null) {
            router.push('/');
            return;
        }

        const roomId = conn.url.split('/')[5];
        async function getUsers() {
            try {
                const res = await fetch(`${API_URL}/ws/getClients/${roomId}`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                });
                const data = await res.json();
                console.log('data: ' + JSON.stringify(data));
                setUsers(data);
            } catch (error) {
                console.log(error);
            }
        }
        getUsers();
    }, []);

    useEffect(() => { //Handle websocket connection
        if (textArea.current) {
            autosize(textArea.current);
        }

        if (conn === null) {
            router.push('/');
            return;
        }

        conn.onmessage = (message) => {
            const m: Message = JSON.parse(message.data);
            if (m.content === 'A new user has joined the room') {
                setUsers([...users, { username: m.username }]);
            }

            if (m.content === 'User left the chat') {
                const deleteUser = users.filter(user => user.username !== m.username);
                setUsers([...deleteUser]);
                setMessages([...messages, m]);
                return;
            }

            user?.username == m.username ? (m.type = 'self') : (m.type = 'recv')
            setMessages([...messages, m])
      
        }

        conn.onclose = () => { }
        conn.onerror = () => { }
        conn.onopen = () => { }

    }, [textArea, messages, conn, users]);



    const sendMessage = () => {
        if (!textArea.current?.value) return;
        if (conn === null) {
            router.push('/');
            return;
        }

        conn.send(textArea.current.value);
        textArea.current.value = '';
    }

    return (
        <>
            <div className='flex flex-col w-full'>
                <div className='p-4 md:mx-6 mb-14'>
                    <ChatBody data={messages} />
                </div>
                <div className='fixed bottom-0 mt-4 w-full'>
                    <div className='flex md:flex-row px-4 py-2 bg-grey md:mx-4 rounded-md'>
                        <div className='flex w-full mr-4 rounded-md border border-blue'>
                            <textarea
                                ref={textArea}
                                placeholder='type your message here'
                                className='w-full h-10 p-2 rounded-md focus:outline-none'
                                style={{ resize: 'none' }}
                            />
                        </div>
                        <div className='flex items-center'>
                            <button
                                className='p-2 rounded-md bg-blue text-white'
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Index;