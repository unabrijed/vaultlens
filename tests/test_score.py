import unittest
from scripts.score_saved_predictions import score
class ScoreTests(unittest.TestCase):
 def test_missing_counts_as_wrong(self):
  t=[{'id':'a','category':'oracle','severity':'high'},{'id':'b','category':'liquidity','severity':'low'}]
  self.assertEqual(score(t,[t[0]])['joint_accuracy'],0.5)
 def test_duplicate_rejected(self):
  t=[{'id':'a','category':'oracle','severity':'high'}]
  with self.assertRaises(ValueError):score(t,t+t)
