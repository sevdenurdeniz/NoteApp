import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import {
  getDatabase,
  set,
  get,
  ref,
  update,
  push,
  remove,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-database.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyD2CSSvpWClO0scpDzCcDV8Fj8LL9c0cco",
  authDomain: "notesapplication-801d0.firebaseapp.com",
  projectId: "notesapplication-801d0",
  storageBucket: "notesapplication-801d0.appspot.com",
  messagingSenderId: "427342739297",
  appId: "1:427342739297:web:74600bc7d782250a26f720",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth();

if (document.getElementById("signup")) {
  const signupButton = document.getElementById("signup");
  signup.addEventListener("click", (e) => {
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;
    var username = document.getElementById("username").value;

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        return set(ref(database, "users/" + user.uid), {
          username: username,
          email: email,
        });
      })
      .then(() => {
        const currentUser = auth.currentUser; //user id ile ilişkilendi authdan
        const notesRef = ref(database, "notes/" + currentUser.uid);
        set(notesRef, {})
          .then(() => {
            Swal.fire(
              "Create User",
              "Create user is successfully  !",
              "success"
            );
            localStorage.setItem("username", username);
            window.location.href = "notes.html";
          })
          .catch((error) => {
            console.log("Hata oluştu:", error);
            alert(error.message);
          });
      })
      .catch((error) => {
        console.log("Hata:", error);
        alert(error.message);
      });
  });
}

if (document.getElementById("login")) {
  const loginButton = document.getElementById("login");

  login.addEventListener("click", (e) => {
    var emailLog = document.getElementById("emailLog").value;
    var passwordLog = document.getElementById("passwordLog").value;

    signInWithEmailAndPassword(auth, emailLog, passwordLog)
      .then((userCredential) => {
        const dt = new Date();
        const user = userCredential.user;
        console.log("User:", user);
        update(ref(database, "users/" + user.uid), {
          last_login: dt,
        })
          .then(() => {
            console.log("Successfully");
            Swal.fire("Log In", "User successfully Log In!", "success");
            const usersRef = ref(database, "users/" + user.uid);

            return get(usersRef);
          })
          .then((snapshot) => {
            const username = snapshot.val().username;
            localStorage.setItem("username", username);
            window.location.href = "notes.html";
          })
          .catch((error) => {
            console.log("Error update", error);
            alert(error.message);
          });
      })
      .catch((error) => {
        console.log("Error signing in:", error);
        alert(error.message);
      });
  });
}
//username yaz
const username = localStorage.getItem("username");
if (username) {
  const kullaniciNameElement = document.getElementById("kullaniciName");
  if (kullaniciNameElement) {
    kullaniciNameElement.innerHTML = username;
  }
}


let isUpdate = false;
document.addEventListener("DOMContentLoaded", function () {




  if (document.getElementById("logoutButton")) {
    const logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener("click", () => {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          Swal.fire("Log Out Of", "User successfully Logged Out!", "success");
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1000);
        })
        .catch((error) => {
          console.log("Çıkış hatası:", error);
          alert("Çıkış yaparken bir hata oluştu.");
        });
    });
  }
  function clearNoteForm() {
    document.getElementById("category").value =
      "<option selected disabled>Category</option>";
    document.getElementById("title").value = "";
    quillEditor.setText(""); // editörün içini boşalt
  }
 
  
 

  function onAddOrEditNote(oParams) {
    if (oParams && Object.keys(oParams).length) {
      if (!window.quillEditor) {
        window.quillEditor = new Quill("#editor", {
          modules: {
            toolbar: [
              [{ header: [1, 2, false] }],
              ['bold', 'italic', 'underline'],
              ['image', 'code-block']
            ]
          },
          placeholder: 'Note..',
          theme: 'snow'
        });
      }
      if (!window.noteTitleInput) {
        window.noteTitleInput = document.getElementById("title");
      }
      if (!window.noteDescriptionInput) {
        window.noteDescriptionInput = document.getElementById("editor");
      }
      if (oParams.isUpdate) {

        window.noteTitleInput.value = oParams.title;

        const delta = quillEditor.clipboard.convert(oParams.content);

        window.quillEditor.setContents(delta);

        const categoryInput = document.getElementById("category");
        if (categoryInput) {
          categoryInput.value = oParams.category;
        }
 
      } else {
        window.noteTitleInput.value = "";
        window.quillEditor.setContents([]);
      }
    }
 isUpdate = oParams.isUpdate;
    $("#exampleModalCenter").on("hidden.bs.modal", function (e) {
      clearNoteForm();
    });
  }




  //not ekleme kısmı +-+-+-
  
  if (document.getElementById("addButton")) {
    const form = document.getElementById("noteForm");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if(isUpdate===false){
      const category = document.getElementById("category").value;
      const title = document.getElementById("title").value;
      const content = document.getElementById("editor").innerHTML;
 
      const currentUser = auth.currentUser;
      const notesRef = ref(database, "notes/" + currentUser.uid);
      const newNoteRef = push(notesRef);
      const noteId = newNoteRef.key;
      const newNote = {
        isUpdate:false,
        category: category, //
        title: title,
        content: content,
        date: new Date().toLocaleDateString(),
      };
 //

      set(newNoteRef, newNote)
        .then(() => {
          console.log("Not kaydedildi");
          console.log(isUpdate);
          Swal.fire("Add New Note!", "Note added successfully!", "success");
          //modalı kapat
          const deneme = document.getElementById("buttonClose");
          deneme.click();
          //modalı temzile
          clearNoteForm();

          // Yeni notu listeye ekleme
          const notesContainer = document.getElementById("notes-container");
          const noteHTML = `
            <div class="col-12 col-lg-4 my-3">
            <div class="notes">
              <div class="row m-0 p-0">
                <div class="col-12 title">${title}</div>
                <div class="col-12"><hr /></div>
                <div class="col-12 notIcerik">
                  <p>${content}</p>
                  <hr />
                  <div class="row">
                    <div class="col-6 my-2 catgTitle"  data-category="${category}">${category}</div>
                    <div class="col-6 text-right my-2"><i class="fa-solid fa-calendar-days"></i>${new Date().toLocaleDateString()}</div>
                  </div>
                </div>
                <div class="over-layer">
                <ul class="links">
                    <li>
                    <a
                    href="javascript:void(0)"
                    class="fa-solid fa-eye view-button"
                    data-id="${noteId}"
                    data-category="${category}"
                  ></a>
                    </li>
                   <li><a title="Update" href="javascript:void(0)" class="fa-solid fa-pen-to-square" data-id="${noteId}" data-category="${category}"></a></li>
                    <li><a title="Delete" href="javascript:void(0)" class="fa-solid fa-trash delete-button deneme" data-id="${noteId}"
                    data-category="${category}"></a></li>
                </ul>
            </div>
              </div>
            </div>
          </div> 
            `;
          notesContainer.insertAdjacentHTML("beforeend", noteHTML);
          isUpdate = false; ///
        })
        .catch((error) => {
          console.log("Hata:", error);
          alert(error.message);
        });
       
    }
      //modalı temzile
      function clearNoteForm() {
        document.getElementById("category").value =
          "<option selected disabled>Category</option>";
        document.getElementById("title").value = "asd";
        quillEditor.setText(""); // editörün içini boşalt
      }
    });
  }
 
  // tablodaki notları ekrana getirme
  if (document.getElementById("notes-container")) {
    const notesContainer = document.getElementById("notes-container");
    //olan bilgilerini getir modala doldur

    auth.onAuthStateChanged((user) => {
      if (user) {
        console.log("oturumlu");
        fetchAndDisplayNotes(user.uid);
      } else {
        console.log("oturumlu değil");
      }
    });

     function fetchAndDisplayNotes(userId) {
      const notesRef = ref(database, `notes/${userId}`);

      get(notesRef)
        .then((snapshot) => {
          const notesData = snapshot.val();

          if (notesData) {
            notesContainer.innerHTML = ""; // notları temizle

            Object.keys(notesData).forEach((noteId) => {
              const note = notesData[noteId];

              const noteHTML = `
              <div class="col-12 col-lg-4 my-3">
              <div class="notes">
                <div class="row m-0 p-0">
                  <div class="col-12 title">${note.title}</div>
                  <div class="col-12"><hr /></div>
                  <div class="col-12 notIcerik">
                    <p>${note.content}</p>
                    <hr />
                    <div class="row">
                      <div class="col-6 my-2 catgTitle" data-category="${note.category}">${note.category}</div>
                      <div class="col-6 text-right my-2"><i class="fa-solid fa-calendar-days"></i>${note.date}</div>
                    </div>
                  </div>
                  <div class="over-layer">
                  <ul class="links">
                      <li>
                      <a
                      href="javascript:void(0)"
                      class="fa-solid fa-eye view-button"
                      data-id="${noteId}"
                      data-category="${note.category}"
                    ></a>
                      </li>
                     <li><a title="Update" href="javascript:void(0)" class="fa-solid fa-pen-to-square" data-id="${noteId}" data-category="${note.category}"></a></li>
                      <li><a title="Delete" href="javascript:void(0)" class="fa-solid fa-trash delete-button deneme" data-id="${noteId}"
                      data-category="${note.category}"></a></li>
                  </ul>
              </div>
                </div>
              </div>
            </div> 
              `;

              notesContainer.insertAdjacentHTML("beforeend", noteHTML);
            });
            //
            //view
            document
              .querySelectorAll(".fa-solid.fa-eye.view-button")
              .forEach((viewButton) => {
                viewButton.addEventListener("click", (event) => {
                  const noteId = event.target.getAttribute("data-id");
                  const category = event.target.getAttribute("data-category");

                  showNoteInModal(category, noteId);
                });
              });
            //sil
            document
              .querySelectorAll(".fa-solid.fa-trash.delete-button")
              .forEach((deleteButton) => {
                deleteButton.addEventListener("click", (event) => {
                  const noteId = event.target.getAttribute("data-id");
                  const category = event.target.getAttribute("data-category");
                  const currentUser = auth.currentUser;

                  deleteNoteFromDatabase(currentUser.uid, category, noteId)
                    .then(() => {
                      const deletedNoteElement = event.target.closest(
                        ".col-12.col-lg-4.my-3"
                      );
                      deletedNoteElement.remove();

                      const notesContainer =
                        document.getElementById("notes-container");
                      if (notesContainer.children.length === 0) {
                        notesContainer.innerHTML = "Hiç Notunuz Yok";
                      }
                    })
                    .catch((error) => {
                      console.log("Hata:", error);
                      alert(error.message);
                    });
                });
              });

            document.querySelectorAll(".fa-solid.fa-pen-to-square.update-button").forEach((updateButton) => {
                updateButton.addEventListener("click", (event) => {
                  const noteId = event.target.getAttribute("data-id");
                  const category = event.target.getAttribute("data-category");
                  handleUpdateButtonClick(noteId, category);
                });
              }); 

          }
        })
        .catch((error) => {
          console.log("Hata:", error);
          alert(error.message);
        });
    }
///burada tekrarlanıyor her şey
    function updateNoteInDatabase(
      userId,
      updatedCategory,
      noteId,
      updatedTitle,
      updatedContent
    ) {
      const noteRef = ref(database, `notes/${userId}/${noteId}`);
     
      update(noteRef, {
        category: updatedCategory,
        title: updatedTitle,
        content: updatedContent,
        date: new Date().toLocaleDateString(),
      })
        .then(() => {
          console.log("Note successfully updated");
          console.log(isUpdate);
          Swal.fire("Update Note", "Note updated successfully!", "success");
           fetchAndDisplayNotes(userId);
//////           isUpdate = false;
        })
        .catch((error) => {
          console.log("Error:", error);
          alert(error.message);
        });
      
    }


    if (document.getElementById("addButton")) {
      document.getElementById("addButton").addEventListener("click", function (e) {
        const newNoteParams = {
          isUpdate: false,
        };
        onAddOrEditNote(newNoteParams);
        $("#exampleModalCenter").modal("show");
      });
    }
  document
    .getElementById("notes-container")
    .addEventListener("click", function (event) {
      if (event.target.classList.contains("fa-pen-to-square")) {
        const noteId = event.target.getAttribute("data-id");
        const category = event.target.getAttribute("data-category");
        const noteRef = ref(
          database,
          `notes/${auth.currentUser.uid}/${noteId}`
        );
 
        get(noteRef)
          .then((snapshot) => {
            const note = snapshot.val();
            const oParams = {
              isUpdate: true,
              category: note.category, //+
              title: note.title,
              content: note.content,
              noteId: noteId,
            };
            onAddOrEditNote(oParams);
            $("#exampleModalCenter").modal("show");
          })
          .catch((error) => {
            console.log("Error:", error);
            alert(error.message);
          });
      } else if (event.target.classList.contains("btn-add")) {
        const oParams = {
          isUpdate: false,
        };
        onAddOrEditNote(oParams);
        $("#exampleModalCenter").modal("show");
        isUpdate = false; ///
      }

     // handleUpdateButtonClick(event);
    });

    //burası ilk tıklananı da alıyor
  function handleUpdateButtonClick(event) {

    //isUpdate = true;
    if (auth.currentUser) {
      const noteId = event.target.getAttribute("data-id");
      const category = event.target.getAttribute("data-category");
      const currentUser = auth.currentUser;
  
      const noteRef = ref(database, `notes/${currentUser.uid}/${noteId}`);
      get(noteRef)
        .then((snapshot) => {
          const note = snapshot.val();
          if (note) {
            const oParams = {
              isUpdate: true,
              category: note.category,
              title: note.title,
              content: note.content,
              noteId: noteId,
            };
            onAddOrEditNote(oParams);
            $("#exampleModalCenter").modal("show");
  
            const saveButton = document.getElementById("submit-button");
            
            saveButton.removeEventListener("click", updateNoteInDatabase);

            saveButton.addEventListener("click", () => {
              const updatedTitle = document.getElementById("title").value;
              const updatedContent = document.getElementById("editor").innerHTML;
              const updatedCategory = document.getElementById("category").value;
              updateNoteInDatabase(
                currentUser.uid,
                updatedCategory,
                noteId,
                updatedTitle,
                updatedContent
              );
               
              $("#exampleModalCenter").modal("hide");
            });
          } else {
            console.log("Note not found.");
          }
        })
        .catch((error) => {
          console.log("Error:", error);
          alert(error.message);
        });
    } else {
      alert("User is not logged in.");
    }
  }
 

    function handleViewButtonClick(event) {
      const noteId = event.target.getAttribute("data-id");
      const category = event.target.getAttribute("data-category");

      showNoteInModal(category, noteId);
    }

    function handleDeleteButtonClick(event) {
      const noteId = event.target.getAttribute("data-id");
      const category = event.target.getAttribute("data-category");
      const currentUser = auth.currentUser;

      // deleteNoteFromDatabase işlemini burada çağırın
      deleteNoteFromDatabase(currentUser.uid, category, noteId)
        .then(() => {
          const deletedNoteElement = event.target.closest(
            ".col-12.col-lg-4.my-3"
          );
          deletedNoteElement.remove();

          const notesContainer = document.getElementById("notes-container");
          if (notesContainer.children.length === 0) {
            notesContainer.innerHTML = "";
          }
        })
        .catch((error) => {
          console.log("Hata:", error);
          alert(error.message);
        });
    }
 
    document.getElementById("notes-container").addEventListener("click", function (event) {
      if (event.target.classList.contains("fa-pen-to-square")) {
        const noteId = event.target.getAttribute("data-id");
        const category = event.target.getAttribute("data-category");
        handleUpdateButtonClick(event, noteId, category);
      } else if (event.target.classList.contains("fa-eye")) {
        // handleViewButtonClick(event);
      } else if (event.target.classList.contains("fa-trash")) {
        // handleDeleteButtonClick(event);
      }
    });

    //view
    /*document.querySelectorAll(".fa-solid.fa-eye").forEach((updateButton) => {
      updateButton.addEventListener("click", (event) => {
        handleViewButtonClick(event);
      });
    });*/

    // silme düğmeleri
    document.querySelectorAll(".fa-solid.fa-trash").forEach((deleteButton) => {
      deleteButton.addEventListener("click", (event) => {
        handleDeleteButtonClick(event);
      });
    });

    // Notu silmek için
    async function deleteNoteFromDatabase(userId, category, noteId) {
      const noteRef = ref(database, `notes/${userId}/${noteId}`);
      try {
        // db den notu sil
        await remove(noteRef);
        console.log("Not başarıyla silindi");

        Swal.fire("Delete!", "Note deleted successfully!", "success");

        const deletedNoteElement = document.querySelector(
          `[data-id="${noteId}"]`
        );
        if (deletedNoteElement) {
          deletedNoteElement.remove();
        }

        const notesContainer = document.getElementById("notes-container");
        if (notesContainer.children.length === 0) {
          notesContainer.innerHTML = "Notlar henüz yüklenmedi";
        }
      } catch (error) {
        console.log("Hata:", error);
        alert(error.message);
      }
    }

    //view
    function showNoteInModal(category, noteId) {
      //db den
      const currentUser = auth.currentUser;
      const noteRef = ref(database, `notes/${currentUser.uid}/${noteId}`);

      get(noteRef)
        .then((snapshot) => {
          const note = snapshot.val();

          // modalın içeriği
          const modalTitleElement = document.getElementById("modalTitle");
          const modalCategoryElement = document.getElementById("modalCategory");
          const modalDateElement = document.getElementById("modalDate");
          const modalContentElement = document.getElementById("modalContent");

          modalTitleElement.textContent = note.title;
          modalCategoryElement.textContent = category;
          modalDateElement.textContent = note.date || "Belirtilmemiş";
          modalContentElement.innerHTML = note.content;

          // modalı göster
          $("#modalView").modal("show");
        })
        .catch((error) => {
          console.log("Hata:", error);
          alert(error.message);
        });
    }

    // View btn tıklama  dinlemek için
    document
      .querySelectorAll(".fa-solid.fa-eye.view-button")
      .forEach((viewButton) => {
        viewButton.addEventListener("click", (event) => {
          const noteId = event.target.getAttribute("data-id");
          const category = event.target.getAttribute("data-category");

          showNoteInModal(category, noteId);
        });
      });

    if (document.getElementById("searchInput")) {
      //search kısmı
      const searchInput = document.getElementById("searchInput");
      searchInput.addEventListener("input", handleSearch);

      function handleSearch() {
        const searchText = searchInput.value.toLowerCase();

        const notesContainers = document.querySelectorAll(
          ".col-12.col-lg-4.my-3"
        );

        notesContainers.forEach((notesContainer) => {
          const title = notesContainer
            .querySelector(".title")
            .textContent.toLowerCase(); // başlık
          const content = notesContainer
            .querySelector(".notIcerik")
            .textContent.toLowerCase(); // içerik

          // Eşleşmeyi kontrol et
          if (title.includes(searchText) || content.includes(searchText)) {
            notesContainer.style.display = "block";
          } else {
            notesContainer.style.display = "none";
          }
        });
      }

      const categoryButtons = document.querySelectorAll(".btn-ctg");
      categoryButtons.forEach((button) => {
        button.addEventListener("click", handleCategoryFilter);
      });

      //category butonları
      function handleCategoryFilter(event) {
        const selectedCategory = event.target.dataset.category;

        const notesContainers = document.querySelectorAll(
          ".col-12.col-lg-4.my-3"
        );

        notesContainers.forEach((notesContainer) => {
          const category = notesContainer
            .querySelector(".catgTitle")
            .textContent.toLowerCase();

          if (selectedCategory === "all" || category === selectedCategory) {
            notesContainer.style.display = "block";  
          } else {
            notesContainer.style.display = "none";  
          }
        });
        // butona active at
        categoryButtons.forEach((button) => {
          button.classList.remove("active");
        });
        event.target.classList.add("active");
      }
    }
  }
});
