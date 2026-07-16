"use client";

import React from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ChatContainer } from '../../components/chat/ChatContainer';
import { useAuth } from '../../lib/auth';
import { Button } from '../../components/ui/Button';
import Link from 'next/link';
import { Alert } from '../../components/ui/Alert';

const ChatPage: NextPage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { conversationId } = router.query;

  if (authLoading) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="warning" className="max-w-md">
          <Alert.Heading>Please sign in</Alert.Heading>
          <p className="mb-4">You need to be signed in to access the chat feature.</p>
          <Link href="/login">
            <Button>Sign In</Button>
          </Link>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Chat | EUshop</title>
        <meta
          name="description"
          content="Communicate with sellers and buyers on EUshop"
        />
      </Head>

      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <Link href="/search">
            <Button variant="outline">Browse Foods</Button>
          </Link>
        </div>

        <ChatContainer
          initialConversationId={typeof conversationId === 'string' ? conversationId : undefined}
          onConversationSelect={(id) => {
            router.push(`/chat?conversationId=${id}`, undefined, { shallow: true });
          }}
        />
      </div>
    </div>
  );
};

export default ChatPage;