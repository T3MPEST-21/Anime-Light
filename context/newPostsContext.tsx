import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NewPostsContextType {
  newPostsCount: number;
  setNewPostsCount: (count: number | ((prev: number) => number)) => void;
}

const NewPostsContext = createContext<NewPostsContextType | undefined>(undefined);

export const NewPostsProvider = ({ children }: { children: ReactNode }) => {
  const [newPostsCount, setNewPostsCount] = useState<number>(0);

  return (
    <NewPostsContext.Provider value={{ newPostsCount, setNewPostsCount }}>
      {children}
    </NewPostsContext.Provider>
  );
};

export const useNewPosts = () => {
  const context = useContext(NewPostsContext);
  if (context === undefined) {
    throw new Error('useNewPosts must be used within a NewPostsProvider');
  }
  return context;
};
