//form de recherche de livre 
$(".h2").after('<div class="js_div" />'); 
    $(".js_div").append('<button class="add_book_btn">Ajouter un livre</button>');//bouton Ajouter 
    $(".js_div").append('<label class="label_titre_du_livre">Titre du livre</label>');//Ajout titre du livre
    $(".js_div").append('<input class="Titre_input" type="texte"></input>');//Ajout titre du livre
    $(".js_div").append('<label class="label_auteur">Auteur</label>');//Ajout Auteur
    $(".js_div").append('<input class="Auteur_input" type="texte"></input>');//Ajout du label Auteur
    $(".js_div").append('<button class="btn_recherche">Rechercher</button>');// bouton rechercher
    $(".js_div").append('<button class="btn_annuler">Annuler</button>');//Ajout du bouton annuler
    $(".js_div").append('<hr class="hr2">');//2ème hr 
    $(".js_div").append('<h2 class="h2_Recherche">Résultats de recherche</h2>');//Titre résultats de recherche

//bouton "Ajouter un livre" et "Rechercher"
$('.label_titre_du_livre').hide();
$('.Titre_input').hide();
$('.label_auteur').hide();
$('.Auteur_input').hide();
$('.btn_recherche').hide();
$('.btn_annuler').hide();
$('.hr2').hide();
$('.h2_Recherche').hide();
$('.add_book_btn').click(function() {
    $('.add_book_btn').hide();
    $('.label_titre_du_livre').show();
    $('.Titre_input').show();
    $('.label_auteur').show();
    $('.Auteur_input').show();
    $('.btn_recherche').show();
    $('.btn_annuler').show();
});

// bouton "Annuler" 
$('.btn_annuler').click(function() {
    $('.add_book_btn').show();
    $('.label_titre_du_livre').hide();
    $('.Titre_input').hide();
    $('.label_auteur').hide();
    $('.Auteur_input').hide();
    $('.btn_recherche').hide();
    $('.btn_annuler').hide();
    $('.hr2').hide();
    $('.h2_Recherche').hide();
    
    cleanTotalResults();
    clean_navigation();
    cleanBooks();
    clean();
});

//Div resultat requête Google API
$(".js_div").after('<div class="nbr_results"></div>');
$(".nbr_results").after('<div class="result_div"></div>');
$(".result_div").after('<div class="navigation"></div>');

//Champs à retourner après la requête google API
var bookUrl = "https://www.googleapis.com/books/v1/volumes?q="; //variable contenant l'url vers l'API google Books
var searchTitle ; // variable qui stocke le contenue de la zone de texte Titre
var searchAuthor ; // variable qui stocke le contenue de la zone de texte auteur
var _url; //variable qui définit le format de l'url que nous allons utiliser en fonction de la recherche auteur, titre ou les deux
var startIndex = 0;
var maxResults = 10;

//Action de bouton "Rechercher" 
$(".btn_recherche").click(function() {
    startIndex = 0;
    searchTitle = $(".Titre_input").val();
    searchAuthor = $(".Auteur_input").val();
    requestGoogleBooks(searchTitle,searchAuthor,startIndex,maxResults);
});
//function that requests the API google book 
function requestGoogleBooks(_searchTitle,_searchAuthor,_startIndex,_maxResults){
    if(_searchTitle === "" && _searchAuthor === ""){
        displayError();
    }else 
    {
        if(_searchTitle !== "" && _searchAuthor !== ""){
            _url = bookUrl + "+intitle:"+ _searchTitle +"+inauthor:" + _searchAuthor+"&startIndex="+_startIndex+"&maxResults="+_maxResults;
        }else if(_searchTitle === "" && _searchAuthor !== ""){
            _url = bookUrl +"+inauthor:" + _searchAuthor+"&startIndex="+_startIndex+"&maxResults="+_maxResults;
        }if(_searchTitle !== "" && _searchAuthor === ""){
            _url = bookUrl + "+intitle:"+ _searchTitle+"&startIndex="+_startIndex+"&maxResults="+_maxResults;
        }
        $.ajax({
            url: _url,
            dataType: "json",
            success: function(response) {
                if (response.totalItems === 0)
                    {
                        $('.hr2').hide();
                        $('.h2_Recherche').hide();
                        cleanBooks();
                        cleanTotalResults();
                        $(".nbr_results").text("Aucun livre n’a été trouvé");
                        clean_navigation();
                    }else{
                    displayTotalResults(response);
                    displayResults(response);
                    navigation_resultats(response,_startIndex,_maxResults);
                    tagAction();
                    }


                                    },
            });
    }
}

//Fonction pour afficher les resultats de la requête de google books API 
function displayResults(_response){
    cleanBooks();
            for (i=0;i<_response.items.length;i++){
                var format_i = zeroPad(i, 4);

                $(".result_div").append('<div id="book_card_'+ format_i +'" />'); // book items container of

                    $('#book_card_' + format_i).append("<div id='book_head_"+format_i+"'/>");//head card (title + bouton favori)
                        $('#book_head_' + format_i).append("<div id ='bookTitle_"+format_i+"'>Titre : "+_response.items[i].volumeInfo.title+"</div>");//title result
                        
                        $('#book_head_' + format_i).append("<img id='bleu_icon_vide_"+format_i+"' src='img/icon_verte.png'>");//icon vide
                        $('#book_head_' + format_i).append("<img id='bleu_icon_plein_"+format_i+"' src='img/icon_verte_plein.png'>");// icon pleine
                        display_icon(_response,i);

                    $('#book_card_' + format_i).append("<div class ='book_ID_"+format_i+"'>Id : "+_response.items[i].id+"</div>");//id result
                    
                    if(_response.items[i].volumeInfo.authors != undefined)
                    {
                    first_author = _response.items[i].volumeInfo.authors[0];
                    }else{
                    first_author = "Auteur inconnu"
                    }
                    $('#book_card_' + format_i).append("<div class ='book_Author_"+format_i+"'> Auteur : "+first_author+"</div>");//authors result
                    var description = _response.items[i].volumeInfo.description;
                    if(description !=undefined){
                        if(description.length > 200) 
                        description = description.substring(0,200) + "...";
                    }else description = 'Information manquante';
                    $('#book_card_' + format_i).append("<div class ='book_Description_"+format_i+"'> Description : "+description+"</div>");//Description Result
                    //image result
                    if(_response.items[i].volumeInfo.imageLinks ==undefined)
                    {
                        var ImgLink = "https://s3-eu-west-1.amazonaws.com/course.oc-static.com/projects/Salesforce_P1_FR/unavailable.png";
                        $('#book_card_' + format_i).append("<div class ='Image_"+format_i+"'></div>");
                        createImage(ImgLink,format_i);
                    }else{
                        var ImgLink = _response.items[i].volumeInfo.imageLinks.smallThumbnail;
                        $('#book_card_' + format_i).append("<div class ='Image_"+format_i+"'></div>");
                        createImage(ImgLink,format_i);
                    }
            }
} 

//Pagination function with the btn's suivants and précédents
function navigation_resultats(_response){
    clean_navigation();
    _totalResults = _response.totalItems;

    //cas1 : startIndex == 0 affichage actuel seulement des premiers résultats et il en existe d'autres
    if (startIndex == 0 && _totalResults>maxResults){
        startIndex =startIndex + maxResults; 
        $(".navigation").prepend("<a href='#' class='suivant'>Suivant</a>");
        $(".suivant").click(function(){
            requestGoogleBooks(searchTitle,searchAuthor,startIndex,maxResults);
            $('html, body').animate({ scrollTop: 0 }, 'slow');
        });
    }else{
        if(startIndex !=0 && startIndex<_totalResults && _response.items.length == maxResults){
            clean_navigation();
            $(".navigation").prepend("<a href='#' class='precedent'>Précédent</a><a href='#' class='suivant'>Suivant</a>");

            $(".suivant").click(function(){
                startIndex =startIndex + maxResults; 
                requestGoogleBooks(searchTitle,searchAuthor,startIndex,maxResults);
                $('html, body').animate({ scrollTop: 0 }, 'slow');
            });

            $(".precedent").click(function() {
                startIndex =startIndex - maxResults;
                requestGoogleBooks(searchTitle,searchAuthor,startIndex,maxResults);
                $('html, body').animate({ scrollTop: 0 }, 'slow');
            });
        }else{
            if(startIndex !=0){
                clean_navigation();
                $(".navigation").prepend("<a href='#' class='precedent'>Précédent</a>");
                $(".precedent").click(function(){
                    startIndex =startIndex - maxResults; 
                    requestGoogleBooks(searchTitle,searchAuthor,startIndex,maxResults);
                    $('html, body').animate({ scrollTop: 0 }, 'slow');
                });}
        }
    }
}

//bookmark
function tagAction(){
    $( "img[id^='bleu_icon_vide_']" ).click(function() {
        var clicked_vide_id = $( this ).attr('id');
        var Four_lastChar_clicked_vide_id = clicked_vide_id.substr(clicked_vide_id.length - 4);
        $("#bleu_icon_plein_"+Four_lastChar_clicked_vide_id).show();
        $("#bleu_icon_vide_"+Four_lastChar_clicked_vide_id).hide();
        save_book_ss(Four_lastChar_clicked_vide_id);
        clean_list_poche();
        display_saved_books();
    });

    $( "img[id^='bleu_icon_plein_']" ).click(function() {
        var clicked_plein_id = $( this ).attr('id');
        var Four_lastChar_clicked_plein_id = clicked_plein_id.substr(clicked_plein_id.length - 4);
        $("#bleu_icon_vide_"+Four_lastChar_clicked_plein_id).show();
        $("#bleu_icon_plein_"+Four_lastChar_clicked_plein_id).hide();
        delete_book_ss($(".book_ID_"+Four_lastChar_clicked_plein_id).text().substr(5));
        clean_list_poche();
        display_saved_books();
    });
};

//function to create an image 
function createImage(source,_format_i) {
    var pastedImage = new Image(100);
    pastedImage.src = source;
    $(".Image_"+_format_i).html(pastedImage);
}

//Pop up Si au moins un des champs n'est pas rempli
function displayError() {
    cleanBooks();
    alert("Veuillez remplir au moins un des deux champs Titre ou Auteur  ");
  }

//refresh la navigation 
  function clean_navigation(){
    $(".navigation").empty();
}

//refresh le résultat
function cleanBooks(){
    $(".result_div").empty();
}   

//refresh list_poche 
function clean_list_poche(){
    $(".list_poche").empty();
}   

//refresh les champs Auteur et Titre
function clean(){
    $(".Titre_input").val('');
    $(".Auteur_input").val('');    
}

//function to format number to 0000
function zeroPad(num, places) {
    var zero = places - num.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + num;
  }

//function to display the number of results of the API
function displayTotalResults(_response){
    $('.hr2').show();
    $('.h2_Recherche').show();
    cleanTotalResults();
    
    $(".nbr_results").text("Un total de "+ _response.totalItems +" résultats ont été trouvés");
}

//function to clear div=.nbr_results
function cleanTotalResults(){
    $(".nbr_results").empty();
}

//fouction to save books in session storage 
function save_book_ss(Four_lastChar){
    var book_tab = [];

    // book_tab ::::::  [0] id, [1] titre, [2] auteur, [3] Description, [4] img link 
    book_tab.push($(".book_ID_"+Four_lastChar).text());
    book_tab.push($("#bookTitle_"+Four_lastChar).text());
    book_tab.push($(".book_Author_"+Four_lastChar).text());
    book_tab.push($(".book_Description_"+Four_lastChar).text());
    book_tab.push($(".Image_"+Four_lastChar).find("img")[0].src);

    //converting book_tab to String
    var json_book_tab = JSON.stringify(book_tab);

    //save results in session storage with ID in key
    sessionStorage.setItem(book_tab[0].substr(5),json_book_tab);
}

//function to delete a book from the session strage
function delete_book_ss(id_to_delete){
    sessionStorage.removeItem(id_to_delete);
}

//creating div named (.list_poche) which contains saved books 
$("#content").after('<div class="list_poche"></div>');
display_saved_books();

//Function to display saved books
function display_saved_books(){
    for(var i = 0; i< sessionStorage.length;i++){
        var key = sessionStorage.key(i);//index of session storage
        saved_tab = JSON.parse(sessionStorage.getItem(key));//value of session storage
        var i_0000 =  zeroPad(i, 4);
        if(saved_tab[0] != undefined)
        {
        $(".list_poche").append('<div id="saved_card_'+ i_0000 +'" />');
            $("#saved_card_"+i_0000).append("<div id ='saved_book_head_"+i_0000+"'></div>");
                $("#saved_book_head_"+i_0000).append("<div id ='saved_bookTitle_"+i_0000+"'>"+saved_tab[1]+"</div>");
                $("#saved_book_head_"+i_0000).append("<img id='delete_icon_"+i_0000+"' src='img/delete.png'  width='15px' height='15px'>");
            $("#saved_card_"+i_0000).append("<div id ='saved_book_ID_"+i_0000+"'>"+saved_tab[0]+"</div>");
            $("#saved_card_"+i_0000).append("<div id ='saved_book_Author_"+i_0000+"'>"+saved_tab[2]+"</div>");
            $("#saved_card_"+i_0000).append("<div id ='saved_book_Description_"+i_0000+"'>"+saved_tab[3]+"</div>");
            $("#saved_card_"+i_0000).append("<div class ='saved_Image_"+i_0000+"'></div>");
            createImage(saved_tab[4],i_0000);
            function createImage(source,_format_i) {
                var pastedImage = new Image(100);
                pastedImage.src = source;
                $(".saved_Image_"+_format_i).html(pastedImage);
            }
        }
    }
    icon_delete_Action();
}

//function to compare between session session storage id et id  of search results
// And display the right tag
function display_icon(response,_i){
    test = false;
    var _format_i = zeroPad(_i, 4);
    for(var j = 0; j< sessionStorage.length; j++){
        var key = sessionStorage.key(j);
        if(response.items[_i].id == key){
            test = true;
            j = sessionStorage.length;
        }
    }
    if(test){
        $("#bleu_icon_vide_"+_format_i).hide();
    }else{
        $("#bleu_icon_plein_"+_format_i).hide();
    }
}

//behavior of the delete icon
function icon_delete_Action(){

    $( "img[id^='delete_icon_']" ).click(function() {
        var clicked_delete_icon = $( this ).attr('id');
        var Four_lastChar_delete_icon = clicked_delete_icon.substr(clicked_delete_icon.length - 4);
        delete_book_ss($("#saved_book_ID_"+Four_lastChar_delete_icon).text().substr(5))
        clean_list_poche();
        display_saved_books();
    });
};

