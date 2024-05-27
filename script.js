function convertToJson() {
    const fileInput = document.getElementById('upload');
    const jsonOutput = document.getElementById('jsonOutput');

    if (fileInput.files.length === 0) {
        alert('Please select a file first!');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const headers = rows[0];
        const jsonData = rows.slice(1)
            .filter(row => row.some(cell => cell !== null && cell.toString().trim() !== ''))
            .map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    const cellValue = row[index];
                    const keys = header.split('.');
                    let tempObj = obj;
                    keys.forEach((key, i) => {
                        if (i === keys.length - 1) {
                            if (key === 'tag_names' || key === 'wrong_answers') {
                                tempObj[key] = cellValue ? cellValue.split(',').map(item => item.trim()) : [];
                            } else if (key === 'output') {
                                tempObj[key] = [cellValue.toString()];
                            } else if (key === 'input_output' || key === 'code_metadata') {
                                // console.log("he");
                                if (!tempObj[key]) tempObj[key] = [];
                                

                                // Assuming the 'input_output' and 'code_metadata' are followed by a unique identifier
                                let itemIndex = parseInt(header[index + 1]);
                                if (!tempObj[key][itemIndex]) tempObj[key][itemIndex] = {};
                                // let ar=[];
                                // ar.push(tempObj[key][itemIndex])
                                // console.log(tempObj[key][itemIndex]);
                                // console.log("he")
                                tempObj = tempObj[key][itemIndex];
                            } else {
                                tempObj[key] = cellValue;
                            }
                        } else {
                            if (!tempObj[key]) tempObj[key] = {};
                            tempObj = tempObj[key];
                        }
                    });
                });
                obj['skills'] = [];
                obj['multimedia'] = [];
                return obj;
            });

            // const updatedJSON = jsonData.map(question => ({
            //     ...question,
            //     code_metadata: [question.code_metadata] 
            //   }));
            let updatedJSON = jsonData.map(question => ({
                ...question,
                input_output: [question.input_output],
                code_metadata: [question.code_metadata] 
              }));

        jsonOutput.value = JSON.stringify(updatedJSON, null, 2);
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

// It will help the user to check whether Correct/Valid JSON is handled inside the Editor or not 
function ValidateJSON() {
    const jsonOutput=document.getElementById('jsonOutput');
    try{
     JSON.parse(jsonOutput.value)
     alert('JSON is valid')
    }
    catch(err){
       alert('JSON is not valid')
       console.error('Error validating JSON',err)
    }
}

// this will help the user to clear the Json Content present inside the input field 
function ClearRespone(){
    const jsonOutput=document.getElementById('jsonOutput');
    jsonOutput.value='';
}


function copyToClipboard() {
    const jsonOutput = document.getElementById('jsonOutput');
    navigator.clipboard.writeText(jsonOutput.value).then(() => {
        alert('JSON copied to clipboard!');
    }).catch(err => {
        console.error('Error in copying text: ', err);
        alert('Failed to copy JSON. Please try manually.');
    });
}
