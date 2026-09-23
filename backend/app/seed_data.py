import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import engine, Base, AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.hackathon import Hackathon
from app.models.rubric import Rubric, RubricCategory
from app.models.team import Team, TeamMember
from app.models.submission import Submission, SubmissionStatus
from app.models.claim import Claim, ClaimStatus
from app.models.evaluation import Evaluation, EvaluationStatus
from app.models.blockchain_record import BlockchainRecord
from app.models.audit_log import AuditLog
from app.services.auth_service import get_password_hash
from app.services.crypto import (
    create_canonical_evaluation_payload,
    compute_canonical_evaluation_hash,
    compute_evidence_bundle_hash,
    sha256_hex
)
from app.services.blockchain_service import BlockchainService

async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Check if already seeded
        check = await db.execute(select(User).where(User.email == "organizer@verijudge.demo"))
        if check.scalar_one_or_none():
            print("Database already seeded with demo data.")
            return

        print("Seeding HackJudge with InnovateX 2026 data...")

        default_pwd = get_password_hash("Demo123!")

        # 1. Users
        organizer = User(
            email="organizer@verijudge.demo",
            hashed_password=default_pwd,
            full_name="Alexander Wright",
            role=UserRole.ORGANIZER,
            organization="Global Hackathon Alliance",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120"
        )
        judge1 = User(
            email="judge@verijudge.demo",
            hashed_password=default_pwd,
            full_name="Dr. Aris Vance",
            role=UserRole.JUDGE,
            organization="MIT AI Lab",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120"
        )
        judge2 = User(
            email="sarah.chen@judge.demo",
            hashed_password=default_pwd,
            full_name="Sarah Chen",
            role=UserRole.JUDGE,
            organization="DeepMind Fellow",
            avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120"
        )
        judge3 = User(
            email="marcus.brody@judge.demo",
            hashed_password=default_pwd,
            full_name="Marcus Brody",
            role=UserRole.JUDGE,
            organization="Y Combinator Partner",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120"
        )
        judge4 = User(
            email="elena.rostova@judge.demo",
            hashed_password=default_pwd,
            full_name="Elena Rostova",
            role=UserRole.JUDGE,
            organization="Oxford Cybernetics",
            avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120"
        )
        judge5 = User(
            email="david.kim@judge.demo",
            hashed_password=default_pwd,
            full_name="David Kim",
            role=UserRole.JUDGE,
            organization="Polygon Foundation",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120"
        )
        participant = User(
            email="participant@verijudge.demo",
            hashed_password=default_pwd,
            full_name="Rohan Sharma",
            role=UserRole.PARTICIPANT,
            organization="Stanford University",
            avatar_url="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120"
        )
        db.add_all([organizer, judge1, judge2, judge3, judge4, judge5, participant])
        await db.flush()

        # 2. Hackathon
        now = datetime.utcnow()
        hackathon = Hackathon(
            title="InnovateX 2026",
            tagline="Pioneering Autonomous & Verifiable Systems",
            description="The premier global technology challenge focusing on decentralized AI, enterprise automation, and verified computation.",
            start_date=now - timedelta(days=2),
            end_date=now + timedelta(days=2),
            is_published=False,
            status="EVALUATING"
        )
        db.add(hackathon)
        await db.flush()

        # 3. Rubric v1.2
        rubric = Rubric(
            hackathon_id=hackathon.id,
            version="v1.2",
            title="Official InnovateX 2026 Judging Rubric",
            description="Official standardized 100-point rubric with integrated AI evidence checkpoints.",
            is_active=True,
            is_immutable=True
        )
        db.add(rubric)
        await db.flush()

        categories_data = [
            {
                "name": "Innovation",
                "max_score": 25.0,
                "weight": 1.0,
                "evaluation_criteria": "Novelty of concept, creative differentiation from existing solutions, intellectual property depth.",
                "ai_evidence_checklist": ["Novel system architecture", "Differentiation from baseline GitHub repositories", "Original algorithm design"]
            },
            {
                "name": "Technical Quality",
                "max_score": 25.0,
                "weight": 1.0,
                "evaluation_criteria": "Robustness, scalability, architecture design, concurrency handling, clean coding standards.",
                "ai_evidence_checklist": ["Benchmarked concurrency/latency tests", "Automated test coverage > 70%", "Secure authentication & rate-limiting"]
            },
            {
                "name": "Problem Relevance",
                "max_score": 20.0,
                "weight": 1.0,
                "evaluation_criteria": "Significance of the problem addressed, tangible business or social impact, clear target audience.",
                "ai_evidence_checklist": ["Empirical baseline metrics", "Clear user pain point documentation", "Domain validation interviews"]
            },
            {
                "name": "Implementation",
                "max_score": 20.0,
                "weight": 1.0,
                "evaluation_criteria": "Degree of completion, functional live demo, end-to-end user journey, working edge cases.",
                "ai_evidence_checklist": ["Functional live deployment URL", "Passing API health check", "Interactive localized UI"]
            },
            {
                "name": "Presentation",
                "max_score": 10.0,
                "weight": 1.0,
                "evaluation_criteria": "Clarity of slide deck, architecture diagrams, concise pitch delivery, team cohesion.",
                "ai_evidence_checklist": ["Complete architecture diagram uploaded", "Slide deck with verifiable claims", "Working demo video"]
            }
        ]

        for idx, cd in enumerate(categories_data):
            cat = RubricCategory(
                rubric_id=rubric.id,
                name=cd["name"],
                max_score=cd["max_score"],
                weight=cd["weight"],
                evaluation_criteria=cd["evaluation_criteria"],
                ai_evidence_checklist=cd["ai_evidence_checklist"],
                order_index=idx
            )
            db.add(cat)

        hackathon.active_rubric_id = rubric.id
        await db.flush()

        # 4. Team 1: GenX AI (Smart Campus Assistant)
        team1 = Team(
            name="GenX AI",
            hackathon_id=hackathon.id,
            join_code="GENX26"
        )
        db.add(team1)
        await db.flush()

        mem1 = TeamMember(team_id=team1.id, user_id=participant.id, role_in_team="Team Lead / Full Stack")
        db.add(mem1)

        sub1 = Submission(
            team_id=team1.id,
            project_title="Smart Campus Assistant",
            problem_statement="University students face fragmented services, 45-minute dining queue delays, and lack localized bilingual guidance.",
            project_description="Smart Campus Assistant is a decentralized AI assistant providing real-time dining queue forecasting, bilingual interactive navigation, and automated resource scheduling.",
            github_url="https://github.com/genx-ai/smart-campus-assistant",
            live_demo_url="https://smart-campus-demo.verijudge.ai",
            ppt_url="https://verijudge.ai/uploads/genx-pitch-v1.2.pdf",
            architecture_url="https://verijudge.ai/uploads/genx-architecture.png",
            screenshots=[
                "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600",
                "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600"
            ],
            demo_video_url="https://youtu.be/campus-assistant-demo",
            tech_stack=["Next.js 15", "FastAPI", "PostgreSQL", "PyTorch", "Tailwind CSS"],
            raw_claims=[
                "Our system supports 10,000 concurrent users without latency degradation.",
                "Our model reduces student waiting time by 40% in campus dining facilities.",
                "Our solution works seamlessly in both Hindi and English with full localization.",
                "Our team engineered a proprietary custom BERT model trained from scratch on campus vernacular.",
                "End-to-end encrypted architecture with decentralized audit logs.",
                "Interactive mobile-first interface optimized for under-50ms render latency.",
                "Automated dining hall inventory synchronizer using WebSocket streaming.",
                "Seamless integration with existing university OAuth2 and LDAP credentials.",
                "Zero-knowledge proof verification for anonymous student voting and feedback.",
                "Resilient offline cache enabling route lookup during network blackouts.",
                "Predictive bus transit arrival engine with 94% forecast precision.",
                "Modular microservices deployment blueprint containerized with Docker."
            ],
            ai_analysis_status=SubmissionStatus.READY,
            ai_status_message="Evidence verification complete. 12 claims analyzed. Ready for judge review.",
            project_summary="Smart Campus Assistant combines queue forecasting, bilingual localization, and campus resource management. AI evidence verification extracted 12 claims: 6 Supported, 3 Partially Supported, 2 Unsupported, and 1 Contradicted.",
            submitted_at=now - timedelta(hours=2)
        )
        db.add(sub1)
        await db.flush()

        # Claims for Team 1 (12 claims matching the spec)
        claims_t1 = [
            {
                "claim": "Our system supports 10,000 concurrent users without latency degradation.",
                "subclaims": ["System supports 10,000 concurrent users", "Zero latency degradation under load"],
                "category": "Technical Quality",
                "status": "Unsupported",
                "confidence": 82,
                "evidence": [{
                    "source_type": "GitHub Repository",
                    "source_name": "Project repository",
                    "url": "https://github.com/genx-ai/smart-campus-assistant",
                    "excerpt": "No load-testing result or benchmark was found in the repository.",
                    "stance": "neutral"
                }],
                "reasoning": "The codebase is present, but it does not contain a performance benchmark or Locust configuration proving 10,000-user capacity."
            },
            {
                "claim": "Our model reduces student waiting time by 40% in campus dining facilities.",
                "subclaims": ["Model optimizes dining queues", "Waiting time reduced by 40%"],
                "category": "Problem Relevance",
                "status": "Partially Supported",
                "confidence": 78,
                "evidence": [{
                    "source_type": "Project Documentation",
                    "source_name": "Whitepaper Section 3",
                    "url": None,
                    "excerpt": "Mathematical simulation indicates 38.5% queue improvement, but field testing was conducted on only 12 participants.",
                    "stance": "supporting"
                }],
                "reasoning": "Theoretical model demonstrated in documentation, but empirical campus-wide reduction metric lacks large-scale trial validation."
            },
            {
                "claim": "Our solution works seamlessly in both Hindi and English with full localization.",
                "subclaims": ["Works in Hindi", "Works in English", "Complete UI localization"],
                "category": "Implementation",
                "status": "Supported",
                "confidence": 95,
                "evidence": [{
                    "source_type": "Source Code",
                    "source_name": "locales/en.json & locales/hi.json",
                    "url": "https://github.com/genx-ai/smart-campus-assistant/tree/main/locales",
                    "excerpt": "Found translation dictionaries for 'en' and 'hi' covering 84 keys.",
                    "stance": "supporting"
                }, {
                    "source_type": "Live Demo",
                    "source_name": "Web UI Language Toggle",
                    "url": "https://smart-campus-demo.verijudge.ai",
                    "excerpt": "Language selector dynamically updates all navigation and guidance copy.",
                    "stance": "supporting"
                }],
                "reasoning": "Verified across code repository localization files and functional live demo dropdown."
            },
            {
                "claim": "Our team engineered a proprietary custom BERT model trained from scratch on campus vernacular.",
                "subclaims": ["Custom BERT architecture", "Trained from scratch"],
                "category": "Technical Quality",
                "status": "Contradicted",
                "confidence": 91,
                "evidence": [{
                    "source_type": "Source Code",
                    "source_name": "requirements.txt & model_loader.py",
                    "url": "https://github.com/genx-ai/smart-campus-assistant/blob/main/requirements.txt",
                    "excerpt": "Code imports huggingface pipeline('sentiment-analysis', model='distilbert-base-uncased') directly without custom checkpoints.",
                    "stance": "contradicting"
                }],
                "reasoning": "Team claimed a proprietary model trained from scratch, but repository dependencies reveal a direct wrapper around standard DistilBERT weights."
            },
            {
                "claim": "End-to-end encrypted architecture with decentralized audit logs.",
                "subclaims": ["End-to-end encryption", "Decentralized audit logging"],
                "category": "Innovation",
                "status": "Supported",
                "confidence": 88,
                "evidence": [{
                    "source_type": "Architecture Diagram",
                    "source_name": "genx-architecture.png",
                    "url": "https://verijudge.ai/uploads/genx-architecture.png",
                    "excerpt": "Architecture document details AES-GCM client encryption before transmission.",
                    "stance": "supporting"
                }],
                "reasoning": "Detailed architecture schematic and cryptographic helper classes verify encryption design."
            },
            {
                "claim": "Interactive mobile-first interface optimized for under-50ms render latency.",
                "subclaims": ["Mobile-first interface", "Under 50ms render latency"],
                "category": "Implementation",
                "status": "Supported",
                "confidence": 90,
                "evidence": [{
                    "source_type": "Lighthouse Audit Report",
                    "source_name": "Performance Profile",
                    "url": None,
                    "excerpt": "First Contentful Paint measured at 0.6s, React component updates profile under 32ms.",
                    "stance": "supporting"
                }],
                "reasoning": "Verified using frontend performance traces on mobile viewports."
            },
            {
                "claim": "Automated dining hall inventory synchronizer using WebSocket streaming.",
                "subclaims": ["Inventory synchronizer", "WebSocket real-time streaming"],
                "category": "Technical Quality",
                "status": "Supported",
                "confidence": 85,
                "evidence": [{
                    "source_type": "Source Code",
                    "source_name": "backend/app/sockets.py",
                    "url": "https://github.com/genx-ai/smart-campus-assistant/blob/main/backend/app/sockets.py",
                    "excerpt": "WebSocket endpoint broadcasts inventory state changes every 5 seconds.",
                    "stance": "supporting"
                }],
                "reasoning": "Working WebSocket implementation found in backend code."
            },
            {
                "claim": "Seamless integration with existing university OAuth2 and LDAP credentials.",
                "subclaims": ["University OAuth2 integration", "LDAP credential sync"],
                "category": "Implementation",
                "status": "Partially Supported",
                "confidence": 70,
                "evidence": [{
                    "source_type": "Documentation",
                    "source_name": "Auth Docs",
                    "url": None,
                    "excerpt": "OAuth2 flow implemented for Google and GitHub, but campus LDAP connector is marked mock.",
                    "stance": "neutral"
                }],
                "reasoning": "OAuth2 works for public providers; campus-specific LDAP adapter uses mock responses."
            },
            {
                "claim": "Zero-knowledge proof verification for anonymous student voting and feedback.",
                "subclaims": ["Zero-knowledge proof verification", "Anonymous student voting"],
                "category": "Innovation",
                "status": "Needs Human Review",
                "confidence": 60,
                "evidence": [{
                    "source_type": "Project Presentation",
                    "source_name": "Pitch Deck Slide 9",
                    "url": None,
                    "excerpt": "Insufficient evidence: Slide mentions Circom circuits, but code repository does not contain compiled .r1cs or zkey files.",
                    "stance": "neutral"
                }],
                "reasoning": "Concept described in slides, but cryptographic proof files are not committed to repo. Requires live judge demonstration."
            },
            {
                "claim": "Resilient offline cache enabling route lookup during network blackouts.",
                "subclaims": ["Offline cache", "Route lookup without network"],
                "category": "Implementation",
                "status": "Supported",
                "confidence": 86,
                "evidence": [{
                    "source_type": "Source Code",
                    "source_name": "public/service-worker.js",
                    "url": "https://github.com/genx-ai/smart-campus-assistant/blob/main/public/service-worker.js",
                    "excerpt": "Service Worker caches campus GeoJSON and map tiles locally.",
                    "stance": "supporting"
                }],
                "reasoning": "Verified Service Worker caching strategy for campus route tiles."
            },
            {
                "claim": "Predictive bus transit arrival engine with 94% forecast precision.",
                "subclaims": ["Predictive bus arrival engine", "94% forecast precision"],
                "category": "Problem Relevance",
                "status": "Partially Supported",
                "confidence": 74,
                "evidence": [{
                    "source_type": "Documentation",
                    "source_name": "Transit Docs",
                    "url": None,
                    "excerpt": "Historical validation notebook displays 91.2% precision on synthetic route data.",
                    "stance": "supporting"
                }],
                "reasoning": "High precision demonstrated on synthetic dataset, but real-world campus transit accuracy was not tested."
            },
            {
                "claim": "Modular microservices deployment blueprint containerized with Docker.",
                "subclaims": ["Modular microservices", "Docker containerization"],
                "category": "Technical Quality",
                "status": "Supported",
                "confidence": 94,
                "evidence": [{
                    "source_type": "Source Code",
                    "source_name": "docker-compose.yml",
                    "url": "https://github.com/genx-ai/smart-campus-assistant/blob/main/docker-compose.yml",
                    "excerpt": "Complete multi-container setup with services for api, web, cache, and db.",
                    "stance": "supporting"
                }],
                "reasoning": "Validated functional multi-container Docker Compose configuration."
            }
        ]

        claims_list_for_bundle = []
        for c in claims_t1:
            cl = Claim(
                submission_id=sub1.id,
                claim_text=c["claim"],
                subclaims=c["subclaims"],
                category=c["category"],
                status=c["status"],
                confidence=c["confidence"],
                reasoning=c["reasoning"],
                evidence=c["evidence"]
            )
            db.add(cl)
            claims_list_for_bundle.append({
                "claim": c["claim"],
                "status": c["status"],
                "confidence": c["confidence"],
                "evidence": c["evidence"]
            })

        evidence_bundle_hash = compute_evidence_bundle_hash(claims_list_for_bundle)
        sub1.evidence_bundle_hash = evidence_bundle_hash
        await db.flush()

        # 5. Team 2: EcoTrack
        team2 = Team(name="EcoTrack", hackathon_id=hackathon.id, join_code="ECO2026")
        db.add(team2)
        await db.flush()
        sub2 = Submission(
            team_id=team2.id,
            project_title="Carbon Footprint IoT Sentinel",
            problem_statement="Industrial facilities struggle to monitor localized Scope 1 greenhouse emissions in real time.",
            project_description="Low-cost hardware telemetry node paired with decentralized ledger accounting for industrial carbon audits.",
            github_url="https://github.com/ecotrack/carbon-sentinel",
            live_demo_url="https://ecotrack.verijudge.ai",
            tech_stack=["Rust", "ESP32", "FastAPI", "React"],
            raw_claims=[
                "Hardware sensor measures CO2 with 2% error tolerance.",
                "Real-time MQTT telemetry pipelines 1,000 readings per second.",
                "Automated compliance report generation compliant with ISO 14064."
            ],
            ai_analysis_status=SubmissionStatus.READY,
            ai_status_message="Evidence verification complete. 3 claims analyzed.",
            project_summary="EcoTrack provides real-time industrial carbon emission tracking with hardware telemetry.",
            evidence_bundle_hash=sha256_hex("ecotrack-bundle")
        )
        db.add(sub2)
        await db.flush()

        # 6. Team 3: MedLink (Rural Telehealth Triage)
        team3 = Team(name="MedLink", hackathon_id=hackathon.id, join_code="MEDLINK")
        db.add(team3)
        await db.flush()
        sub3 = Submission(
            team_id=team3.id,
            project_title="Rural Telehealth Diagnostic Hub",
            problem_statement="Primary healthcare centers in remote villages lack access to specialist diagnostic consultation.",
            project_description="Offline-first medical record exchange and lightweight AI triage assistant operating over intermittent cellular networks.",
            github_url="https://github.com/medlink/rural-triage",
            live_demo_url="https://medlink.verijudge.ai",
            tech_stack=["Flutter", "Python", "SQLite", "WebRTC"],
            raw_claims=[
                "Compresses 12-lead ECG readings to under 15KB for low-bandwidth 2G links.",
                "Computer vision triage identifies basic dermatological lesions with 89% sensitivity.",
                "End-to-end HIPAA compliant patient identity anonymizer."
            ],
            ai_analysis_status=SubmissionStatus.READY,
            ai_status_message="Evidence verification complete. 3 claims analyzed.",
            project_summary="MedLink delivers low-bandwidth rural telehealth triage with offline ECG compression.",
            evidence_bundle_hash=sha256_hex("medlink-bundle")
        )
        db.add(sub3)
        await db.flush()

        # 7. Evaluations
        # Evaluation 1: Judge Dr. Aris Vance evaluating GenX AI
        # This evaluation includes a justified score for Technical Quality (24/25 despite unsupported 10k claim)
        # It is anchored to the blockchain!
        eval_time = now - timedelta(hours=1)
        eval1_scores = {
            "Innovation": 24.0,
            "Technical Quality": 24.0,
            "Problem Relevance": 19.0,
            "Implementation": 19.0,
            "Presentation": 9.0
        }
        eval1_final_score = sum(eval1_scores.values()) # 95.0
        eval1_justification = (
            "During the in-person booth demonstration, the team ran a live k6 stress test on their local cluster "
            "simulating 10,000 concurrent virtual users with sub-80ms response times. Although the test artifact "
            "was omitted from the GitHub master branch, the live demonstration conclusively proved their concurrency claims."
        )
        eval1_justification_hash = sha256_hex(eval1_justification)

        eval1_canonical_payload = create_canonical_evaluation_payload(
            hackathon_id=hackathon.id,
            team_id=team1.id,
            judge_id=judge1.id,
            rubric_version=rubric.version,
            final_score=eval1_final_score,
            category_scores=eval1_scores,
            justification_hash=eval1_justification_hash,
            evidence_bundle_hash=sub1.evidence_bundle_hash,
            timestamp=eval_time.isoformat() + "Z"
        )
        eval1_canonical_hash = compute_canonical_evaluation_hash(eval1_canonical_payload)

        eval1 = Evaluation(
            hackathon_id=hackathon.id,
            team_id=team1.id,
            judge_id=judge1.id,
            rubric_version=rubric.version,
            category_scores=eval1_scores,
            final_score=eval1_final_score,
            category_comments={
                "Innovation": "Strong novel architectural concepts with decentralized trust.",
                "Technical Quality": "High caliber implementation with WebSocket streaming.",
                "Problem Relevance": "Addresses verified student bottlenecks on campus.",
                "Implementation": "Working bilingual localized UI was very impressive.",
                "Presentation": "Clear pitch and responsive team."
            },
            overall_feedback="Outstanding multi-disciplinary project with stellar live execution.",
            justification=eval1_justification,
            justification_hash=eval1_justification_hash,
            evidence_bundle_hash=sub1.evidence_bundle_hash,
            canonical_hash=eval1_canonical_hash,
            status=EvaluationStatus.SUBMITTED,
            created_at=eval_time
        )
        db.add(eval1)
        await db.flush()

        # Blockchain Anchor for Eval 1
        tx1 = "0x8f3c4e92a812b77c5d901a2f64b19e23091c7a884d50821b01c36798e4f1891a"
        bc1 = BlockchainRecord(
            evaluation_id=eval1.id,
            network="Polygon Amoy (Testnet)",
            tx_hash=tx1,
            block_number=14983021,
            evaluation_hash=eval1_canonical_hash,
            status="ANCHORED",
            explorer_url=f"https://amoy.polygonscan.com/tx/{tx1}",
            timestamp=eval_time + timedelta(seconds=12)
        )
        db.add(bc1)

        # Register in simulated blockchain service
        BlockchainService.register_preseeded_record(
            evaluation_id=eval1.id,
            evaluation_hash=eval1_canonical_hash,
            tx_hash=tx1,
            block_number=14983021,
            timestamp=eval_time.isoformat() + "Z"
        )

        # Evaluation 2: Sarah Chen on GenX AI
        eval2_scores = {
            "Innovation": 22.0,
            "Technical Quality": 21.0,
            "Problem Relevance": 18.0,
            "Implementation": 19.0,
            "Presentation": 9.0
        }
        eval2_payload = create_canonical_evaluation_payload(
            hackathon_id=hackathon.id,
            team_id=team1.id,
            judge_id=judge2.id,
            rubric_version=rubric.version,
            final_score=89.0,
            category_scores=eval2_scores,
            justification_hash=sha256_hex(""),
            evidence_bundle_hash=sub1.evidence_bundle_hash,
            timestamp=(eval_time + timedelta(minutes=5)).isoformat() + "Z"
        )
        eval2_hash = compute_canonical_evaluation_hash(eval2_payload)
        eval2 = Evaluation(
            hackathon_id=hackathon.id,
            team_id=team1.id,
            judge_id=judge2.id,
            rubric_version=rubric.version,
            category_scores=eval2_scores,
            final_score=89.0,
            category_comments={"Technical Quality": "Solid codebase, clean React architecture."},
            overall_feedback="Well-rounded solution.",
            justification="",
            justification_hash=sha256_hex(""),
            evidence_bundle_hash=sub1.evidence_bundle_hash,
            canonical_hash=eval2_hash,
            status=EvaluationStatus.SUBMITTED,
            created_at=eval_time + timedelta(minutes=5)
        )
        db.add(eval2)
        await db.flush()

        tx2 = "0x3e18a2bc45009f7a8123ccdd8123ef66911299bb334411ee882200aabbccdd11"
        bc2 = BlockchainRecord(
            evaluation_id=eval2.id,
            network="Polygon Amoy (Testnet)",
            tx_hash=tx2,
            block_number=14983035,
            evaluation_hash=eval2_hash,
            status="ANCHORED",
            explorer_url=f"https://amoy.polygonscan.com/tx/{tx2}",
            timestamp=eval_time + timedelta(minutes=5, seconds=15)
        )
        db.add(bc2)
        BlockchainService.register_preseeded_record(eval2.id, eval2_hash, tx2, 14983035, (eval_time + timedelta(minutes=5)).isoformat() + "Z")

        # 8. Cross-Judge Anomaly on MedLink (Team 3)
        # Sarah Chen gave 74.0 (Technical: 16/25)
        # Elena Rostova gave 72.0 (Technical: 15/25)
        # Marcus Brody gave 96.0 (Technical: 25/25) -> Anomaly!
        # This gives a clear, realistic anomaly demo.
        eval_m1_scores = {"Innovation": 18.0, "Technical Quality": 16.0, "Problem Relevance": 17.0, "Implementation": 15.0, "Presentation": 8.0}
        eval_m1_payload = create_canonical_evaluation_payload(hackathon.id, team3.id, judge2.id, rubric.version, 74.0, eval_m1_scores, sha256_hex(""), sub3.evidence_bundle_hash, (eval_time + timedelta(minutes=10)).isoformat() + "Z")
        eval_m1_hash = compute_canonical_evaluation_hash(eval_m1_payload)
        eval_m1 = Evaluation(
            hackathon_id=hackathon.id,
            team_id=team3.id,
            judge_id=judge2.id,
            rubric_version=rubric.version,
            category_scores=eval_m1_scores,
            final_score=74.0,
            category_comments={"Technical Quality": "ECG compression worked, but neural triage was inaccurate on test samples."},
            overall_feedback="Valuable concept, technical triage needs refinement.",
            justification="",
            justification_hash=sha256_hex(""),
            evidence_bundle_hash=sub3.evidence_bundle_hash,
            canonical_hash=eval_m1_hash,
            status=EvaluationStatus.SUBMITTED,
            created_at=eval_time + timedelta(minutes=10)
        )
        db.add(eval_m1)
        await db.flush()

        tx_m1 = "0x55aa66bb77cc88dd99ee00112233445566778899aabbccddeeff001122334455"
        bc_m1 = BlockchainRecord(evaluation_id=eval_m1.id, network="Polygon Amoy (Testnet)", tx_hash=tx_m1, block_number=14983060, evaluation_hash=eval_m1_hash, status="ANCHORED", explorer_url=f"https://amoy.polygonscan.com/tx/{tx_m1}", timestamp=eval_time + timedelta(minutes=10))
        db.add(bc_m1)
        BlockchainService.register_preseeded_record(eval_m1.id, eval_m1_hash, tx_m1, 14983060, (eval_time + timedelta(minutes=10)).isoformat() + "Z")

        # Judge Marcus Brody on MedLink: High outlier 96.0 (25/25 Technical Quality)
        eval_m2_scores = {"Innovation": 25.0, "Technical Quality": 25.0, "Problem Relevance": 19.0, "Implementation": 18.0, "Presentation": 9.0}
        eval_m2_payload = create_canonical_evaluation_payload(hackathon.id, team3.id, judge3.id, rubric.version, 96.0, eval_m2_scores, sha256_hex("Exceptional vision"), sub3.evidence_bundle_hash, (eval_time + timedelta(minutes=15)).isoformat() + "Z")
        eval_m2_hash = compute_canonical_evaluation_hash(eval_m2_payload)
        eval_m2 = Evaluation(
            hackathon_id=hackathon.id,
            team_id=team3.id,
            judge_id=judge3.id,
            rubric_version=rubric.version,
            category_scores=eval_m2_scores,
            final_score=96.0,
            category_comments={"Technical Quality": "Outstanding engineering and medical triage vision."},
            overall_feedback="Huge commercial potential.",
            justification="Exceptional vision and offline performance.",
            justification_hash=sha256_hex("Exceptional vision"),
            evidence_bundle_hash=sub3.evidence_bundle_hash,
            canonical_hash=eval_m2_hash,
            status=EvaluationStatus.SUBMITTED,
            created_at=eval_time + timedelta(minutes=15)
        )
        db.add(eval_m2)
        await db.flush()

        tx_m2 = "0x77bb88cc99dd00ee112233445566778899aabbccddeeff001122334455667788"
        bc_m2 = BlockchainRecord(evaluation_id=eval_m2.id, network="Polygon Amoy (Testnet)", tx_hash=tx_m2, block_number=14983080, evaluation_hash=eval_m2_hash, status="ANCHORED", explorer_url=f"https://amoy.polygonscan.com/tx/{tx_m2}", timestamp=eval_time + timedelta(minutes=15))
        db.add(bc_m2)
        BlockchainService.register_preseeded_record(eval_m2.id, eval_m2_hash, tx_m2, 14983080, (eval_time + timedelta(minutes=15)).isoformat() + "Z")

        # 9. Audit Logs
        logs = [
            AuditLog(
                entity_type="SUBMISSION",
                entity_id=sub1.id,
                actor_id=participant.id,
                actor_role="PARTICIPANT",
                actor_name="Rohan Sharma",
                action="SUBMISSION_CREATED",
                details={"project_title": sub1.project_title, "team": "GenX AI"},
                timestamp=eval_time - timedelta(minutes=30)
            ),
            AuditLog(
                entity_type="SUBMISSION",
                entity_id=sub1.id,
                actor_role="AI_AGENT",
                actor_name="VeriJudge AI Evidence Agent",
                action="AI_ANALYSIS_COMPLETED",
                details={"claims_extracted": 12, "evidence_bundle_hash": sub1.evidence_bundle_hash},
                timestamp=eval_time - timedelta(minutes=25)
            ),
            AuditLog(
                entity_type="EVALUATION",
                entity_id=eval1.id,
                actor_id=judge1.id,
                actor_role="JUDGE",
                actor_name="Dr. Aris Vance",
                action="GUARDRAIL_CHALLENGE_TRIGGERED",
                details={"category": "Technical Quality", "awarded": 24.0, "reason": "High score with unverified 10,000 user claim"},
                timestamp=eval_time - timedelta(minutes=2)
            ),
            AuditLog(
                entity_type="EVALUATION",
                entity_id=eval1.id,
                actor_id=judge1.id,
                actor_role="JUDGE",
                actor_name="Dr. Aris Vance",
                action="EVALUATION_FINALIZED_AND_ANCHORED",
                details={"final_score": 95.0, "canonical_hash": eval1_canonical_hash, "tx_hash": tx1},
                timestamp=eval_time
            )
        ]
        db.add_all(logs)

        await db.commit()
        print("Database seed completed successfully with InnovateX 2026 data.")

if __name__ == "__main__":
    asyncio.run(seed_database())
