type SwitchProps = {
    checked: boolean;
    onChange: (checked: boolean) => void;
};

function Switch({ checked, onChange }: SwitchProps) {
    return (
        <label className="switch">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />

            <span className="slider"></span>
        </label>
    );
}

export default Switch;