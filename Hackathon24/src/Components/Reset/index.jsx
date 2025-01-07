export function Reset({}){
    const handleClear = () => {
        window.localStorage.clear();
        window.location.reload();
    };
    return(
        <div>
            <button onClick={handleClear}>Reset</button>
        </div>
    );
}