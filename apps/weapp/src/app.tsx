import React, { useEffect } from 'react';
import '@nutui/nutui-react-taro/dist/style.css';
import './app.scss';
import { useAuthStore } from './store/auth';

export default function App(props: { children: React.ReactNode }) {
  const restore = useAuthStore((s) => s.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  return props.children;
}
