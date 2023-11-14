/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Message = {
  __typename?: 'Message';
  clientId?: Maybe<Scalars['String']['output']>;
  message?: Maybe<Scalars['String']['output']>;
  time?: Maybe<Scalars['String']['output']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  sendMessage?: Maybe<Message>;
};


export type MutationSendMessageArgs = {
  clientId?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  roomId?: InputMaybe<Scalars['String']['input']>;
  time?: InputMaybe<Scalars['String']['input']>;
};

export type Query = {
  __typename?: 'Query';
  messages?: Maybe<Array<Maybe<Message>>>;
};

export type Subscription = {
  __typename?: 'Subscription';
  message?: Maybe<Message>;
};


export type SubscriptionMessageArgs = {
  roomId?: InputMaybe<Scalars['String']['input']>;
};
