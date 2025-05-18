## 👩🏻‍💻 BuddhAi Developers 🧑🏻‍💻

<br/>


<div align="center">
<table>
<th>팀원</th>
    <th> 김태욱 <a href="https://github.com/Taew00k"><br/><img src="https://img.shields.io/badge/Github-181717?style=flat-square&logo=Github&logoColor=white"/><a></th>
	  <th> 김수빈 <a href="https://github.com/dewbeeny"><br/><img src="https://img.shields.io/badge/Github-181717?style=flat-square&logo=Github&logoColor=white"/></a></th>
    <th> 안성우 <a href="https://github.com/aeeengsungwoo"><br/><img src="https://img.shields.io/badge/Github-181717?style=flat-square&logo=Github&logoColor=white"/></a></th>
    <th> 엄태우 <a href="https://github.com/teom142"><br/><img src="https://img.shields.io/badge/Github-181717?style=flat-square&logo=Github&logoColor=white"/></a></th>
    <tr>
    <td>  </td>
    	<td>
        <img width="200" alt="IMG_1293" src="https://avatars.githubusercontent.com/u/127061738?v=4" />
      </td>
    	<td>
        <img width="200" alt="IMG_1341" src="https://avatars.githubusercontent.com/u/146052459?v=4" />
     </td>
      <td>
        <img width="200" alt="IMG_1342" src="https://avatars.githubusercontent.com/u/132185864?v=4" />
      </td>
    	<td>
        <img width="200" alt="IMG_1340" src="https://avatars.githubusercontent.com/u/74529426?v=4" />
     </td>
    </tr>
    <tr>
	<td>역할</td>
	<td>
		<p align="center">CLIENT</p>
	</td>
	<td>
		<p align="center">CLIENT</p>
	</td>
	<td>
		<p align="center">SERVER</p>
	</td>
    <td>
		<p align="center">AI</p>
	</td>
    </tr>
  </table>
</div>
<br />


## **🚀 How to Install & Register the Extension**

  

### **1. Clone the Repository**

```
git clone https://github.com/GDSC-DGU/2025-APAC-SolutionChallenge-BuddhAi.git
cd 2025-APAC-SolutionChallenge-BuddhAi
cd client
```

### **2. Install Dependencies**

```
yarn install
```

### **3. Build the Project**

```
yarn build
```

After building, a dist folder will be created in the root directory. This folder contains the manifest.json file and all necessary files for the extension.

----------

## **🧩 How to Load as a Chrome Extension**

1.  Open Chrome and go to chrome://extensions/
    
2.  Enable **Developer mode** (top right corner)
    
3.  Click **Load unpacked**
    
4.  Select the dist folder generated in the previous step
    

  

Your extension should now appear in the Chrome extensions list and be ready for use.

----------

## **🛠️ Troubleshooting**

-   **Yarn command not found:**
    
    Make sure Yarn is installed. See the [official guide](https://classic.yarnpkg.com/en/docs/install/).
    
-   **Build errors:**
    
    Delete node_modules and reinstall:
    

```
rm -rf node_modules
yarn install
```
    
-   **Extension not loading:**
    
    Double-check that manifest.json exists in the dist folder and the folder structure matches Chrome Extension requirements.
    

----------

For more details, refer to the [original README](./README.md) or [project repository](https://github.com/GDSC-DGU/2025-APAC-SolutionChallenge-BuddhAi).

----------
