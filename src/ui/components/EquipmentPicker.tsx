import { ALL_EQUIPMENT, EQUIPMENT_LABELS, type Equipment } from '../../storage/schema';

export default function EquipmentPicker({ value, onChange }: { value: Equipment[]; onChange: (v: Equipment[]) => void }) {
  const toggle = (e: Equipment) =>
    onChange(value.includes(e) ? value.filter((x) => x !== e) : ALL_EQUIPMENT.filter((x) => x === e || value.includes(x)));
  return (
    <div className="choice-list">
      {ALL_EQUIPMENT.map((e) => (
        <label key={e} className={`choice ${value.includes(e) ? 'selected' : ''}`}>
          <input type="checkbox" checked={value.includes(e)} onChange={() => toggle(e)} />
          {EQUIPMENT_LABELS[e]}
        </label>
      ))}
    </div>
  );
}
