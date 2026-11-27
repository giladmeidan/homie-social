# Engine 2 in the render pipeline: the batch-entry switch, the title tag, the plan checks.
# Run: python3 -m unittest discover -s test -p 'test_*.py'
import importlib.util, json, os, sys, tempfile, unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, '..', 'scripts'))
import rules_v2 as R  # noqa: E402

spec = importlib.util.spec_from_file_location('render_batch', os.path.join(HERE, '..', 'scripts', 'render-batch.py'))
RB = importlib.util.module_from_spec(spec)
spec.loader.exec_module(RB)

MOTION = {'assertions': [
    {'kind': 'appearsBy', 'selector': '#t1 .l2', 'bySec': 0.05},
    {'kind': 'appearsBy', 'selector': '#prompt .pill', 'bySec': 3.0},
]}
META = {'engine': 'v2', 'look': 'paper', 'format': 'experiment', 'bpm': 100, 'bars': 4, 'dur': 9.6,
        'cover': {'t': 0, 'title': 'יום 1. שני חלבים.'}, 'prompt': {'t': 1.2, 'text': 'שלחו לשותפים החדשים.'},
        'beats': {'payoff': 7.2, 'outro': None}, 'voice': None}


def item(**kw):
    base = {'reel': 1041, 'episode': 'r1041', 'name': 'reel-h041-experiment-x', 'caption': 'x',
            'engine': 'v2', 'format': 'experiment', 'slot': '2026-11-28 13'}
    base.update(kw)
    return base


class Engine2(unittest.TestCase):
    def setUp(self):
        self.sent = tempfile.mkdtemp()
        self.reel = tempfile.mkdtemp()
        self.write('index.html', '<script>E2.publish({ id: "x" });</script>')
        self.write('index.motion.json', json.dumps(MOTION))

    def write(self, name, text):
        with open(os.path.join(self.reel, name), 'w', encoding='utf8') as f:
            f.write(text)

    def test_only_entries_that_say_v2_are_engine_2(self):
        self.assertTrue(RB.is_v2({'engine': 'v2'}))
        self.assertFalse(RB.is_v2({}))
        self.assertFalse(RB.is_v2({'engine': 'v1'}))
        self.assertTrue(R.applies({'reel': 57, 'engine': 'v2'}))

    def test_title_gets_e2_after_the_format_once(self):
        self.assertEqual(RB.title_of(item(title='ריל H41 · Experiment · שני חלבים')), 'ריל H41 · Experiment · E2 · שני חלבים')
        self.assertEqual(RB.title_of(item(title='ריל H41 · Experiment · E2 · שני חלבים')), 'ריל H41 · Experiment · E2 · שני חלבים')
        self.assertEqual(RB.title_of(item(title='שני חלבים')), 'שני חלבים · E2')
        self.assertEqual(RB.title_of({'name': 'n', 'title': 'ריל H40 · Roommate moment · לוח המזגן'}), 'ריל H40 · Roommate moment · לוח המזגן')

    def test_good_reel_passes(self):
        R.pre_check_v2(item(), self.reel, self.sent)
        R.facts_check_v2(item(), META)

    def test_format_and_slot_are_required_but_a_preview_needs_no_slot(self):
        with self.assertRaises(ValueError) as e:
            R.pre_check_v2(item(format=None, slot=None), self.reel, self.sent)
        self.assertIn('"format"', str(e.exception))
        self.assertIn('"slot"', str(e.exception))
        R.pre_check_v2(item(slot=None, preview=True), self.reel, self.sent)

    def test_one_reel_per_slot_across_both_engines(self):
        with open(os.path.join(self.sent, '1040.json'), 'w') as f:
            json.dump({'reel': 1040, 'slot': '2026-11-28 13'}, f)
        with self.assertRaises(ValueError) as e:
            R.pre_check_v2(item(), self.reel, self.sent)
        self.assertIn('already has reel 1040', str(e.exception))
        R.pre_check_v2(item(replaces=1040), self.reel, self.sent)

    def test_the_reel_must_publish_and_assert_headline_and_ask(self):
        self.write('index.html', '<html></html>')
        self.write('index.motion.json', json.dumps({'assertions': [{'kind': 'appearsBy', 'selector': '#prompt', 'bySec': 3.0}]}))
        with self.assertRaises(ValueError) as e:
            R.pre_check_v2(item(), self.reel, self.sent)
        msg = str(e.exception)
        self.assertIn('E2.publish', msg)
        self.assertIn('frame 0', msg)
        os.remove(os.path.join(self.reel, 'index.motion.json'))
        with self.assertRaises(ValueError) as e:
            R.pre_check_v2(item(), self.reel, self.sent)
        self.assertIn('index.motion.json is missing', str(e.exception))

    def test_published_facts(self):
        for change, expect in (({'cover': {}}, 'no cover'), ({'prompt': {'t': 3.4, 'text': 'x'}}, 'by 3s'),
                               ({'prompt': None}, 'no prompt'), ({'format': 'pick'}, 'format'),
                               ({'voice': None}, None), ({'voice': {'say': 1}}, 'voice'), ({'dur': None}, 'length')):
            meta = dict(META, **change)
            if expect is None:
                R.facts_check_v2(item(), meta)
                continue
            with self.assertRaises(RuntimeError) as e:
                R.facts_check_v2(item(), meta)
            self.assertIn(expect, str(e.exception))

    def test_length_rule_is_the_same_as_engine_1(self):
        R.post_check(item(), 9.6, RB.beats_v2(META), None)
        with self.assertRaises(RuntimeError):
            R.post_check(item(format='smart'), 9.6, RB.beats_v2(META), None)

    def test_beats_have_the_dashboard_shape(self):
        b = RB.beats_v2(META)
        self.assertEqual(b['dur'], 9.6)
        self.assertEqual(b['scenes'][0], ['bar1', 0.0, 2.4])
        self.assertEqual(len(b['scenes']), 4)
        self.assertEqual(b['declared'], {'payoff': 7.2})
        self.assertEqual(RB.beats_v2({'dur': 8.0})['scenes'], [])

    def test_the_build_does_not_get_the_pipeline_secrets(self):
        secrets = {'ADMIN_TOKEN': 'a', 'TELEGRAM_BOT_TOKEN': 'b', 'TELEGRAM_CHAT_ID': 'c', 'ELEVENLABS_API_KEY': 'd',
                   'HOMIE_SOCIAL_URL': 'e', 'SOME_SECRET': 'f'}
        old = dict(os.environ)
        os.environ.update(secrets, E2_KEEP_ME='yes')
        try:
            env = RB.build_env_v2()
        finally:
            os.environ.clear()
            os.environ.update(old)
        for k in secrets:
            self.assertNotIn(k, env)
        self.assertEqual(env['E2_KEEP_ME'], 'yes')
        self.assertIn('PATH', env)
        self.assertTrue(env['E2_EXPORT_DIR'].endswith(os.path.join('build', 'export')))

    def test_workflow_switch_sees_only_waiting_engine_2_reels(self):
        d = tempfile.mkdtemp()
        bf = os.path.join(d, 'b.json')
        with open(bf, 'w') as f:
            json.dump({'reels': [{'reel': 1040}, {'reel': 995001, 'engine': 'v2'}]}, f)
        self.assertTrue(RB.needs_engine2([bf]))
        with open(bf, 'w') as f:
            json.dump({'reels': [{'reel': 1040}, {'engine': 'v2'}, 'junk']}, f)
        self.assertFalse(RB.needs_engine2([bf]))
        self.assertFalse(RB.needs_engine2([os.path.join(d, 'missing.json')]))


if __name__ == '__main__':
    unittest.main()
