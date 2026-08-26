type SearchBarProps = {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

function SearchBar({
    value,
    onChange,
    placeholder = "Pesquisar..."
}: SearchBarProps) {

    return (

        <div className="search-bar">

            <input

                type="text"

                value={value}

                placeholder={placeholder}

                onChange={(e) => onChange(e.target.value)}

            />

        </div>

    );

}

export default SearchBar;