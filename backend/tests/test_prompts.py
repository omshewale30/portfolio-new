import unittest
from datetime import date

from prompts import CURRENT_STATUS, jarvis_instructions


class JarvisInstructionsTests(unittest.TestCase):
    def test_instructions_carry_today_and_current_status(self):
        instructions = jarvis_instructions(date(2026, 10, 5))

        self.assertIn("Today's date is October 5, 2026.", instructions)
        self.assertIn(CURRENT_STATUS, instructions)
        self.assertIn("He is not a student.", instructions)
        self.assertIn("ASD-STE100", instructions)
        self.assertIn("https://www.omshewale.com", instructions)


if __name__ == "__main__":
    unittest.main()
