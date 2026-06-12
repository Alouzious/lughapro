-- Seed the platform admin account and 4 official free courses.
-- Idempotent: safe to run multiple times.

-- Platform admin (owns "LughaPro Official" courses). password_hash is intentionally
-- non-verifiable so this account cannot be logged into directly.
INSERT INTO users (id, email, password_hash, full_name, role)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'official@lughapro.com',
  '$2b$12$disabledPlatformAdminAccountHashNotForLoginxxxxxxxxxx',
  'LughaPro Official',
  'admin'
)
ON CONFLICT (id) DO NOTHING;

-- ===== Course 1: Kiswahili for Beginners: Your First 100 Words (A1, 5 modules) =====
INSERT INTO courses (id, tutor_id, title, description, level, price, status, tags, estimated_hours, published_at)
VALUES (
  'c0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'Kiswahili for Beginners: Your First 100 Words',
  'Build a foundation of the 100 most useful Kiswahili words and start forming simple sentences from day one.',
  'A1', 0, 'published', ARRAY['vocabulary','beginner','foundations'], 4, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO modules (id, course_id, title, content_type, content_body, order_index, is_free_preview, credits_on_complete) VALUES
('d1000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000001','Welcome & Pronunciation','text','Karibu! Kiswahili is phonetic — every letter is pronounced. Vowels: a (ah), e (eh), i (ee), o (oh), u (oo). Practice: jambo, asante, karibu.',1,TRUE,10),
('d1000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000001','Everyday Nouns','text','Learn 20 essential nouns: maji (water), chakula (food), nyumba (house), gari (car), mtu (person), kitabu (book), and more.',2,FALSE,10),
('d1000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000001','Common Verbs','text','Action words: kula (to eat), kunywa (to drink), kwenda (to go), kuja (to come), kusoma (to read), kuandika (to write).',3,FALSE,10),
('d1000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000001','Useful Adjectives','text','Describe things: kubwa (big), ndogo (small), nzuri (good/nice), mbaya (bad), mpya (new), -zee (old).',4,FALSE,10),
('d1000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000001','Putting It Together','text','Form simple sentences: Ninakula chakula (I am eating food). Tunakwenda nyumbani (We are going home).',5,FALSE,10)
ON CONFLICT (id) DO NOTHING;

-- ===== Course 2: Greetings & Introductions in Kiswahili (A1, 3 modules) =====
INSERT INTO courses (id, tutor_id, title, description, level, price, status, tags, estimated_hours, published_at)
VALUES (
  'c0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000001',
  'Greetings & Introductions in Kiswahili',
  'Master the warm, layered greetings that open every Kiswahili conversation and learn to introduce yourself with confidence.',
  'A1', 0, 'published', ARRAY['greetings','conversation','beginner'], 2, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO modules (id, course_id, title, content_type, content_body, order_index, is_free_preview, credits_on_complete) VALUES
('d2000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000002','Basic Greetings','text','Jambo / Hujambo (Hello), Habari? (How are you?), Nzuri (Fine), Asante (Thank you), Karibu (Welcome).',1,TRUE,10),
('d2000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000002','Respectful Greetings','text','Shikamoo (respectful greeting to elders) — response Marahaba. Habari za asubuhi (morning), za mchana (afternoon), za jioni (evening).',2,FALSE,10),
('d2000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000002','Introducing Yourself','text','Jina langu ni ... (My name is ...). Ninatoka ... (I come from ...). Nafurahi kukutana nawe (Nice to meet you).',3,FALSE,10)
ON CONFLICT (id) DO NOTHING;

-- ===== Course 3: Numbers, Time & Days in Kiswahili (A1, 4 modules) =====
INSERT INTO courses (id, tutor_id, title, description, level, price, status, tags, estimated_hours, published_at)
VALUES (
  'c0000000-0000-0000-0000-000000000003',
  'a0000000-0000-0000-0000-000000000001',
  'Numbers, Time & Days in Kiswahili',
  'Count, tell the time the Swahili way, and talk about days of the week and dates.',
  'A1', 0, 'published', ARRAY['numbers','time','beginner'], 3, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO modules (id, course_id, title, content_type, content_body, order_index, is_free_preview, credits_on_complete) VALUES
('d3000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000003','Numbers 1-10','text','moja, mbili, tatu, nne, tano, sita, saba, nane, tisa, kumi.',1,TRUE,10),
('d3000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000003','Numbers 11-100','text','kumi na moja (11), ishirini (20), thelathini (30), hamsini (50), mia moja (100).',2,FALSE,10),
('d3000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000003','Telling Time','text','Swahili time starts at sunrise: saa moja = 7 o''clock. saa mbili = 8 o''clock. asubuhi (morning), usiku (night).',3,FALSE,10),
('d3000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000003','Days of the Week','text','Jumatatu (Mon), Jumanne (Tue), Jumatano (Wed), Alhamisi (Thu), Ijumaa (Fri), Jumamosi (Sat), Jumapili (Sun).',4,FALSE,10)
ON CONFLICT (id) DO NOTHING;

-- ===== Course 4: Kiswahili for East Africa Travellers (A2, 6 modules) =====
INSERT INTO courses (id, tutor_id, title, description, level, price, status, tags, estimated_hours, published_at)
VALUES (
  'c0000000-0000-0000-0000-000000000004',
  'a0000000-0000-0000-0000-000000000001',
  'Kiswahili for East Africa Travellers',
  'Practical Kiswahili for getting around Kenya, Tanzania and beyond — markets, transport, food and safari.',
  'A2', 0, 'published', ARRAY['travel','practical','A2'], 5, NOW()
) ON CONFLICT (id) DO NOTHING;

INSERT INTO modules (id, course_id, title, content_type, content_body, order_index, is_free_preview, credits_on_complete) VALUES
('d4000000-0000-0000-0000-000000000001','c0000000-0000-0000-0000-000000000004','At the Airport','text','Ndege (plane), pasipoti (passport), mizigo (luggage). Iko wapi ...? (Where is ...?)',1,TRUE,10),
('d4000000-0000-0000-0000-000000000002','c0000000-0000-0000-0000-000000000004','Getting Around','text','Basi (bus), teksi (taxi), bodaboda (motorbike taxi). Nataka kwenda ... (I want to go to ...). Ni bei gani? (How much?)',2,FALSE,10),
('d4000000-0000-0000-0000-000000000003','c0000000-0000-0000-0000-000000000004','At the Market','text','Sokoni (at the market). Bei nzuri (good price). Punguza bei (lower the price). Ngapi? (How many/much?)',3,FALSE,10),
('d4000000-0000-0000-0000-000000000004','c0000000-0000-0000-0000-000000000004','Ordering Food','text','Menyu (menu), wali (rice), nyama (meat), samaki (fish), chai (tea). Naomba ... (May I have ...).',4,FALSE,10),
('d4000000-0000-0000-0000-000000000005','c0000000-0000-0000-0000-000000000004','On Safari','text','Wanyama (animals): simba (lion), tembo (elephant), twiga (giraffe). Hifadhi (reserve/park). Angalia! (Look!)',5,FALSE,10),
('d4000000-0000-0000-0000-000000000006','c0000000-0000-0000-0000-000000000004','Emergencies & Help','text','Msaada! (Help!), Daktari (doctor), Polisi (police), Nimepotea (I am lost). Tafadhali nisaidie (Please help me).',6,FALSE,10)
ON CONFLICT (id) DO NOTHING;
