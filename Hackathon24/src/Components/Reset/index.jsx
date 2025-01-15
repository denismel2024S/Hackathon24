export function Reset(){
    const handleClear = () => {
        const response = confirm("Are you sure you want to clear all information?")
        if(response){
            window.localStorage.clear();
            window.location.reload();
        }
    };
    return(
        <button className = "resetButton" onClick={handleClear}>Reset</button>
    );
}