import PropTypes from "prop-types";

// The seven-stage loop from note002, drawn as a clockwise ring. Colors come from the theme
// tokens so the diagram follows the light/dark toggle like the rest of the prose.
const STAGES = ["Map", "Re-encode", "Prove", "Trace", "Evaluate", "Experiment", "Monitor"];

const CENTER = 240;
const RADIUS = 165;
const PILL_WIDTH = 108;
const PILL_HEIGHT = 50;
const STEP = 360 / STAGES.length;

const pointAt = (degrees, radius = RADIUS) => {
  const radians = (degrees * Math.PI) / 180;
  return { x: CENTER + radius * Math.cos(radians), y: CENTER + radius * Math.sin(radians) };
};

// Stage 0 sits at 12 o'clock; the rest follow clockwise.
const stageAngle = (index) => -90 + index * STEP;

const Chevron = ({ angle, color }) => {
  const { x, y } = pointAt(angle);
  return (
    <path
      d="M -5 -6 L 3 0 L -5 6"
      transform={`translate(${x} ${y}) rotate(${angle + 90})`}
      style={{ fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" }}
    />
  );
};

Chevron.propTypes = {
  angle: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

const AiEngineeringLoop = () => {
  const lastAngle = stageAngle(STAGES.length - 1);
  const returnStart = pointAt(lastAngle);
  const returnEnd = pointAt(-90);
  const returnLabel = pointAt(lastAngle + STEP / 2, RADIUS + 26);

  return (
    <figure className="note-diagram">
      <svg
        viewBox="0 36 480 392"
        role="img"
        aria-labelledby="ai-loop-title ai-loop-desc"
        className="mx-auto block h-auto w-full max-w-[32rem]"
      >
        <title id="ai-loop-title">The AI engineering loop</title>
        <desc id="ai-loop-desc">
          Seven stages in a clockwise loop: Map, Re-encode, Prove, Trace, Evaluate, Experiment and Monitor. Monitor
          leads back to Map to start the next lap.
        </desc>

        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          style={{ fill: "none", stroke: "var(--color-border-hover)", strokeWidth: 1.5 }}
        />
        <path
          d={`M ${returnStart.x} ${returnStart.y} A ${RADIUS} ${RADIUS} 0 0 1 ${returnEnd.x} ${returnEnd.y}`}
          style={{ fill: "none", stroke: "var(--color-accent)", strokeWidth: 2.5 }}
        />

        {STAGES.map((stage, index) => (
          <Chevron
            key={`chevron-${stage}`}
            angle={stageAngle(index) + STEP / 2}
            color={index === STAGES.length - 1 ? "var(--color-accent)" : "var(--color-text-subtle)"}
          />
        ))}

        <text
          x={returnLabel.x + 18}
          y={returnLabel.y}
          textAnchor="end"
          style={{ fill: "var(--color-accent)", fontFamily: "var(--font-mono)", fontSize: 13 }}
        >
          back to Map
        </text>

        {STAGES.map((stage, index) => {
          const { x, y } = pointAt(stageAngle(index));
          return (
            <g key={stage} transform={`translate(${x - PILL_WIDTH / 2} ${y - PILL_HEIGHT / 2})`}>
              <rect
                width={PILL_WIDTH}
                height={PILL_HEIGHT}
                rx={10}
                style={{
                  fill: "var(--color-bg-elevated)",
                  stroke: index === 0 ? "var(--color-accent)" : "var(--color-border-focus)",
                  strokeWidth: 1.5,
                }}
              />
              <text
                x={PILL_WIDTH / 2}
                y={19}
                textAnchor="middle"
                style={{ fill: "var(--color-text-meta)", fontFamily: "var(--font-mono)", fontSize: 12 }}
              >
                {String(index + 1).padStart(2, "0")}
              </text>
              <text
                x={PILL_WIDTH / 2}
                y={38}
                textAnchor="middle"
                style={{
                  fill: "var(--color-text-primary)",
                  fontFamily: "var(--font-display)",
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                {stage}
              </text>
            </g>
          );
        })}

        <text
          x={CENTER}
          y={CENTER - 6}
          textAnchor="middle"
          style={{
            fill: "var(--color-text-meta)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.08em",
          }}
        >
          THE BORING
        </text>
        <text
          x={CENTER}
          y={CENTER + 14}
          textAnchor="middle"
          style={{
            fill: "var(--color-text-meta)",
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            letterSpacing: "0.08em",
          }}
        >
          AI ENGINEERING LOOP
        </text>
      </svg>
      <figcaption>Monitor feeds the next lap of Map.</figcaption>
    </figure>
  );
};

export default AiEngineeringLoop;
