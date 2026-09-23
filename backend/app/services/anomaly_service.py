import math
from typing import List, Dict, Any
from app.models.evaluation import Evaluation

class AnomalyService:
    @staticmethod
    def calculate_stats(evaluations: List[Evaluation]) -> Dict[str, Any]:
        """
        Calculates cross-judge statistics for a single team's evaluations:
        - Mean, median, standard deviation of overall scores
        - Category-level averages and individual judge deltas
        - Outlier flags with respectful, non-accusatory wording
        """
        if not evaluations:
            return {
                "evaluation_count": 0,
                "mean_score": 0.0,
                "median_score": 0.0,
                "std_deviation": 0.0,
                "category_averages": {},
                "scores_by_judge": [],
                "has_anomaly": False,
                "anomaly_details": []
            }

        scores = [e.final_score for e in evaluations]
        n = len(scores)
        mean_score = sum(scores) / n

        sorted_scores = sorted(scores)
        if n % 2 == 1:
            median_score = sorted_scores[n // 2]
        else:
            median_score = (sorted_scores[n // 2 - 1] + sorted_scores[n // 2]) / 2.0

        variance = sum((s - mean_score) ** 2 for s in scores) / n if n > 1 else 0.0
        std_dev = math.sqrt(variance)

        # Collect category scores
        categories_dict: Dict[str, List[float]] = {}
        scores_by_judge = []

        for e in evaluations:
            judge_name = e.judge.full_name if e.judge else f"Judge {e.judge_id[:6]}"
            scores_by_judge.append({
                "judge_id": e.judge_id,
                "judge_name": judge_name,
                "final_score": round(e.final_score, 1),
                "category_scores": e.category_scores or {}
            })
            for cat, sc in (e.category_scores or {}).items():
                categories_dict.setdefault(cat, []).append(float(sc))

        category_averages = {
            cat: round(sum(sc_list) / len(sc_list), 1)
            for cat, sc_list in categories_dict.items()
        }

        # Anomaly detection: only meaningful if >= 2 evaluations
        anomaly_details = []
        if n >= 2:
            for cat, sc_list in categories_dict.items():
                cat_mean = sum(sc_list) / len(sc_list)
                for e in evaluations:
                    judge_sc = float((e.category_scores or {}).get(cat, cat_mean))
                    other_scores = [float((other.category_scores or {}).get(cat, cat_mean)) for other in evaluations if other.id != e.id]
                    other_avg = sum(other_scores) / len(other_scores) if other_scores else cat_mean
                    delta = abs(judge_sc - other_avg)

                    # If deviation in a category is >= 6.5 points (significant on a 20-25 pt scale)
                    if delta >= 6.5:
                        judge_name = e.judge.full_name if e.judge else f"Judge {e.judge_id[:6]}"
                        direction = "higher" if judge_sc > other_avg else "lower"
                        anomaly_details.append({
                            "team_id": e.team_id,
                            "team_name": e.team.name if e.team else "Team",
                            "project_title": e.team.submission.project_title if e.team and e.team.submission else "Project",
                            "category": cat,
                            "outlier_judge_id": e.judge_id,
                            "outlier_judge_name": judge_name,
                            "judge_score": round(judge_sc, 1),
                            "other_judges_average": round(other_avg, 1),
                            "deviation": round(delta, 1),
                            "recommendation": (
                                f"Review recommended: One {cat} score ({judge_sc:g}) awarded by {judge_name} differs "
                                f"significantly ({delta:.1f} pts {direction}) from peer judges (avg: {other_avg:.1f}). "
                                f"Review the category comments and evidence before finalizing results."
                            )
                        })

        has_anomaly = len(anomaly_details) > 0 or std_dev >= 8.5

        return {
            "evaluation_count": n,
            "mean_score": round(mean_score, 1),
            "median_score": round(median_score, 1),
            "std_deviation": round(std_dev, 1),
            "category_averages": category_averages,
            "scores_by_judge": scores_by_judge,
            "has_anomaly": has_anomaly,
            "anomaly_details": anomaly_details
        }
