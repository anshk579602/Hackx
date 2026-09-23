import pytest
from app.services.anomaly_service import AnomalyService

class MockJudge:
    def __init__(self, name):
        self.full_name = name

class MockTeam:
    def __init__(self, name):
        self.name = name
        self.submission = None

class MockEval:
    def __init__(self, eval_id, judge_name, score, category_scores):
        self.id = eval_id
        self.team_id = "team-1"
        self.judge_id = f"judge-{judge_name.lower()}"
        self.judge = MockJudge(judge_name)
        self.team = MockTeam("MedLink")
        self.final_score = score
        self.category_scores = category_scores

def test_anomaly_detection_flags_outlier():
    evaluations = [
        MockEval("e1", "Sarah Chen", 74.0, {"Technical Quality": 16.0, "Innovation": 20.0}),
        MockEval("e2", "Elena Rostova", 72.0, {"Technical Quality": 15.0, "Innovation": 19.0}),
        MockEval("e3", "Marcus Brody", 96.0, {"Technical Quality": 25.0, "Innovation": 24.0}) # Significant outlier
    ]

    stats = AnomalyService.calculate_stats(evaluations)
    assert stats["has_anomaly"] is True
    assert stats["evaluation_count"] == 3
    assert len(stats["anomaly_details"]) > 0

    anomaly = stats["anomaly_details"][0]
    assert anomaly["category"] == "Technical Quality"
    assert anomaly["outlier_judge_name"] == "Marcus Brody"
    assert "Review recommended" in anomaly["recommendation"]
