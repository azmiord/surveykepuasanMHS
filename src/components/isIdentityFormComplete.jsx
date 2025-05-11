const isIdentityFormComplete = (formData) => {
    return Object.values(formData).every(val => val.trim() !== '');
  };
  
  export default isIdentityFormComplete;
  