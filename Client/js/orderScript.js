String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

function compare(item1,item2){
    if(item1.type === item2.type){
        return (item1.customer === item2.customer) ? 0 : ((item1.customer > item2.customer) ? 1 : -1);
    } else {
        return (item1.type > item2.type) ? 1 : -1;
    }
}

socket.emit('updateOrders',{'season':'2013'});
socket.emit('login',{'name': 'Rune', 'password': "kodeord"});

function deleteOrder(date){
    socket.emit('deleteOrder',{date: date});
}

socket.on('orders',function(data){
    var tabs = "";
    var tabsContent = "";
            
    data.forEach(function(order){
        var date = new Date(order.date);
                    
        tabs += "<li><a href=\"#" + order.date + "\" data-toggle=\"tab\">" + date.getDate() + "/" + date.getMonth() + "</a></li>"; 
                        
        order.orderItems.sort(compare);
                        
        tabsContent += '<div class="tab-pane" id="'+order.date+'">';
                        
        //Lets add a header
        tabsContent += '<h2>Bestillinger for ' + date.getDate() + '/' + date.getMonth() +' <button onClick="deleteOrder('+ order.date +')" class="btn btn-danger btn-mini">Delete</button></h2>';
                        
        //Then the table
        tabsContent += '<table class="table table-striped">';
                        
        //Add a header row
        tabsContent += '<thead><tr><th></th>';
                        
        var addedCustomers = [];
                        
        order.orderItems.forEach(function(orderItem){
            if($.inArray(orderItem.customer,addedCustomers) === -1){
                tabsContent += '<th>' + orderItem.customer + '</th>';
                addedCustomers.push(orderItem.customer);
            }
        });
                        
        tabsContent += '</tr></thead>';
                        
                        
        //Then the actual rows
        var currentType = "";
        var addCloseRowTag = false;
                        
        order.orderItems.forEach(function(orderitem){
            if(currentType != orderitem.type){
                if(addCloseRowTag) {
                    tabsContent += '</tr>';
                        addCloseRowTag = false;
                    }
                tabsContent += '<tr><th>'+orderitem.type+'</th>';
            }
                            
            tabsContent += '<td><input min="0" id="orderItemSpinner'+ order._id + orderitem.customer.replace(/\s/g,'') + orderitem.type.replace(/\s/g,'') +'" type="number" value="' + orderitem.amount + '"/></td>';
                            
            updateOrderItem(orderitem,order._id);                
                            
            if(currentType != orderitem.type){
                currentType = orderitem.type;
                addCloseRowTag = true;
            }
        });
                        
        tabsContent += '</table></div>';                        
    });
       
    tabs += "<li><a href=\"#add\" data-toggle=\"tab\">Tilføj</a></li>";
    tabs += "<li class='active'><a href=\"#total\" data-toggle=\"tab\">Total</a></li>"; 
                                    
    //Create add tab
    tabsContent += createAddTab(data);
                    
    //Create total tab
    tabsContent += '<div class="tab-pane active" id="total"><h2>Total</h2><table id="totalTable" class="table table-striped table-bordered table-hover">';
    tabsContent += createTotalTabContent(data);
    tabsContent += '<table></div>';
       
    $("#tabs-container").html(tabs);
    $("#tab-content").html(tabsContent);
    
    $('.datepicker').datepicker({format: "dd/mm/yyyy"});
    $('#createOrderForm').submit(function(){
        socket.emit('createOrder',{date: $('.datepicker').val()})
    });
});

socket.on('error',function(data){
    $(document.body).html('<div id="errorModal" class="modal hide fade"><div class="modal-header"><h3>Der er opstået en fejl..</h3></div><div class="modal-body"><p>Prøv at genopfriske siden. Hvis fejlen stadigt opstår, kontakt support.</p></div></div>');
    
    $('#errorModal').modal();
});

socket.on('newTotal',function(data){
    $('#totalTable').html(createTotalTabContent(data));
});

function createAddTab(data){
    var tabsContent = '<div class="tab-pane" id="add"><h2>Add a new date</h2>';
    
    tabsContent += '<form id="createOrderForm" action="#" class="form-inline"><fieldset><input class="datepicker" type="text" placeholder="Select a date"><button type="submit" class="btn">Add</button></fieldset></form>';
    
    tabsContent += '</div>';
    
    $(function() {
        $('.datepicker').datepicker();
    });
    
    return tabsContent;
}

function updateOrderItem(orderitem,orderId){
    if ( typeof updateOrderItem.lastTimeoutId == 'undefined' ) {
        updateOrderItem.lastTimeoutId = -1;
    }

    $(document).on("change",("#orderItemSpinner"+ orderId + orderitem.customer + orderitem.type).replace(/\s/g,''),function(){        
        if(updateOrderItem.lastTimeOutId !== -1){
            window.clearTimeout(updateOrderItem.lastTimeOutId);
        }
        updateOrderItem.lastTimeOutId = window.setTimeout(function(){
            socket.emit('updateOrderItem',
            {
                orderId: orderId, 
                customer: orderitem.customer, 
                type: orderitem.type, 
                newValue: $(("#orderItemSpinner" + orderId + orderitem.customer + orderitem.type).replace(/\s/g,'')).val()
            });
            
            updateOrderItem.lastTimeOutId = -1;
        },100);                  
    });
}

function createTotalTabContent(data){
    var tabsContent = "";
    
    //Ensure the sort is done
    data.forEach(function(order){
        order.orderItems.sort(compare);
    });
        
    //First the headers
    tabsContent += '<thead><tr><th>Kunde & Type</th>';
    
    data.forEach(function(order){
        var date = new Date(order.date);
    
       tabsContent += '<th>' + date.getDate() + '/' + date.getMonth() + '</th>'; 
    });    
    
    tabsContent += '<th>Total</th></thead></tr>';
    
    //Then build the actual table
    var currentCustomer = "";
    var currentType = "";
    var customers = [];
    var types = [];
    
    
    //Build the list of customers and types from the first orderItem
    data[0].orderItems.forEach(function(orderItem){    
        if($.inArray(orderItem.customer,customers) === -1){
            customers.push(orderItem.customer);
        }
        
        if($.inArray(orderItem.type,types) === -1){
            types.push(orderItem.type);
        }
    });

    var amounts = {};
    var totals = {};
    
    //Prepare the totals array
    customers.forEach(function(customer){ 
        totals[customer] = {}  
        
        types.forEach(function(type) { totals[customer][type] = 0 });
    });
    
    //Generate the amount data
    data.forEach(function(order){
        amounts[order._id] = {};
        
        var seenCustomers = [];
        order.orderItems.forEach(function(orderItem){
            if($.inArray(orderItem.customer,seenCustomers) === -1){
                amounts[order._id][orderItem.customer] = {};
                seenCustomers.push(orderItem.customer);
            }
            amounts[order._id][orderItem.customer][orderItem.type] = orderItem.amount;
            totals[orderItem.customer][orderItem.type] += orderItem.amount;
        });
    });
    
    //Then create the table
    customers.forEach(function(customer){
        tabsContent += '<tr class="info"><td colspan="' + (data.length + 2) + '">'+customer+'</td></tr><tr>';
        
        types.forEach(function(type){
            tabsContent += '<td>&nbsp;&nbsp;&nbsp;-&nbsp;' + type + '</td>';
            
            data.forEach(function(order) { 
                tabsContent += '<td>' + amounts[order._id][customer][type] + '</td>';
            });
            tabsContent += '<td>' + totals[customer][type] + '</td>';
            tabsContent += '</tr>'
        });
        
        tabsContent += '</tr>';
    });
    
    return tabsContent;
}