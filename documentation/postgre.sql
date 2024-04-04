--
-- PostgreSQL database dump
--

-- Dumped from database version 12.18
-- Dumped by pg_dump version 16.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'SQL_ASCII';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


SET default_tablespace = '';
SET default_table_access_method = heap;


CREATE TABLE public.giveaway_members (
    id integer NOT NULL,
    "memberId" character varying(255) NOT NULL,
    win boolean DEFAULT false,
    "winDate" date,
    "giveawayId" integer NOT NULL
);

CREATE SEQUENCE public.giveaway_members_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.giveaway_members_id_seq OWNED BY public.giveaway_members.id;

CREATE TABLE public.giveaways (
    id integer NOT NULL,
    summary text,
    now character varying(255),
    "lastWinner" character varying(40),
    "guildId" character varying(40) NOT NULL,
    slug character varying(50),
    "createdAt" date DEFAULT now()
);


CREATE SEQUENCE public.giveaways_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.giveaways_id_seq OWNED BY public.giveaways.id;

ALTER TABLE ONLY public.giveaway_members ALTER COLUMN id SET DEFAULT nextval('public.giveaway_members_id_seq'::regclass);

ALTER TABLE ONLY public.giveaways ALTER COLUMN id SET DEFAULT nextval('public.giveaways_id_seq'::regclass);

ALTER TABLE ONLY public.giveaway_members
    ADD CONSTRAINT giveaway_members_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.giveaways
    ADD CONSTRAINT giveaways_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX "unique member in a giveaway" ON public.giveaway_members USING btree ("giveawayId", "memberId");

ALTER TABLE ONLY public.giveaway_members
    ADD CONSTRAINT giveaway_members_giveawayid_fkey FOREIGN KEY ("giveawayId") REFERENCES public.giveaways(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--
