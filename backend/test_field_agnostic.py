import unittest

from app import filter_resume_claims, select_resume_claim
from services.question_generator import _build_prompt, _parse_questions
from services.resume_parser import extract_resume_profile


FIELD_FIXTURES = {
    "cse": ("Java, OOP, DBMS, SQL, React, Python", "Built a web application with Java and SQL."),
    "eee": ("Power Systems, Electrical Machines, Control Systems, MATLAB", "Designed a solar power monitoring system."),
    "mechanical": ("Thermodynamics, Manufacturing, Fluid Mechanics, CAD", "Designed a refrigeration assembly using CAD."),
    "civil": ("Structural Engineering, Surveying, Concrete Technology, AutoCAD", "Designed a reinforced concrete structure."),
    "ece": ("Digital Electronics, Signals and Systems, Embedded Systems, VLSI", "Built an embedded signal acquisition prototype."),
}


class FieldAgnosticProfileTests(unittest.TestCase):
    def test_topics_are_resume_derived_and_projects_stay_separate(self):
        for field, (skills, project) in FIELD_FIXTURES.items():
            profile = extract_resume_profile(
                f"Education\nBachelor of Technology in {field}\nSkills\n{skills}\nProjects\n{project}"
            )
            self.assertTrue(profile["technical_topics"], field)
            self.assertTrue(any(item.casefold() in skills.casefold() for item in profile["technical_topics"]), field)
            self.assertTrue(profile["projects"], field)
            self.assertFalse(any(project.casefold() == topic.casefold() for topic in profile["technical_topics"]), field)

    def test_prompt_is_field_agnostic_and_prioritizes_topics(self):
        prompt = _build_prompt(
            "Power Systems, Electrical Machines, Control Systems",
            {
                "field": "Electrical Engineering",
                "technical_topics": ["Power Systems", "Control Systems"],
                "core_subjects": ["Power Systems"],
                "frameworks_tools": ["MATLAB"],
                "projects": ["Designed a solar power monitoring system."],
                "resume_claims": ["Designed a solar power monitoring system."],
            },
        )
        self.assertIn("Power Systems", prompt)
        self.assertIn("core_subjects", prompt)
        self.assertIn("Projects are supporting evidence", prompt)
        self.assertIn("one short, direct", prompt)
        self.assertIn("definitions, differences, why/how", prompt)
        self.assertIn("basic, intermediate, and more challenging", prompt)
        self.assertIn("Do not assume a specific field", prompt)
        self.assertNotIn("junior software engineer", prompt.lower())

    def test_explicit_profile_categories_remain_separate(self):
        profile = extract_resume_profile(
            "Core Subjects\nThermodynamics, Fluid Mechanics\n"
            "Programming Languages\nPython\nFrameworks\nCAD\nDatabases\nProcess Data Store\n"
            "Technical Domains\nManufacturing\nProjects\nDesigned a thermal system."
        )
        self.assertEqual(profile["core_subjects"], ["Thermodynamics", "Fluid Mechanics"])
        self.assertEqual(profile["programming_skills"], ["Python"])
        self.assertEqual(profile["frameworks_tools"], ["CAD"])
        self.assertEqual(profile["databases"], ["Process Data Store"])
        self.assertEqual(profile["technical_domains"], ["Manufacturing"])
        self.assertEqual(profile["projects"], ["Designed a thermal system."])

    def test_claim_filtering_does_not_require_software_terms(self):
        claims = filter_resume_claims([
            "Designed and tested a solar power monitoring system using measured load data and control logic.",
            "Performed structural analysis and concrete mix evaluation for a laboratory design study.",
        ])
        self.assertEqual(len(claims), 2)

    def test_used_resume_claim_is_not_selected_again(self):
        claims = ["Designed a solar power monitoring system using measured load data and control logic."]
        self.assertIsNone(
            select_resume_claim(claims, "solar power monitoring control system", {0})
        )

    def test_initial_question_parser_removes_exact_duplicates(self):
        questions = _parse_questions(
            '{"questions": ["What is a transaction?", "What is a transaction!", '
            '"What is an index?", "Why use an index?", "What is a deadlock?", '
            '"What is normalization?", "What is a schema?"]}'
        )
        self.assertEqual(len(questions), 6)
        self.assertEqual(len({question.lower() for question in questions}), 6)


if __name__ == "__main__":
    unittest.main()
