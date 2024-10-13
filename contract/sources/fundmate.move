module 0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435::fundmatev2 {
    use std::vector;
    use aptos_framework::coin;
    use aptos_framework::aptos_coin::AptosCoin;
    use aptos_framework::timestamp;
    use aptos_framework::event;
    use aptos_framework::account;
    use std::table::{Self, Table};
    use std::signer;
    use std::string::String;
    
    struct UserProfile has key {
        user_name: String,
        friends: vector<address>,
        conversations: Table<address, Conversation>,
        sent_payment_requests: Table<address, vector<PaymentRequest>>,
        received_payment_requests: Table<address, vector<PaymentRequest>>,
        requestees: vector<address>,
        requesters: vector<address>,
        user_created_events: event::EventHandle<UserCreatedEvent>,
        friend_added_events: event::EventHandle<FriendAddedEvent>,
        payment_sent_events: event::EventHandle<PaymentSentEvent>,
        message_sent_events: event::EventHandle<MessageSentEvent>,
        payment_requested_events: event::EventHandle<PaymentRequestedEvent>,
    }
    
    struct UserInfo has store, drop, copy {
        address: address,
        user_name: String,
    }

    struct AllUsers has key {
        users: vector<UserInfo>,
    }

    struct Conversation has store {
        messages: vector<Message>,
        payments: vector<Payment>,
        payment_requests: vector<PaymentRequest>,
    }

    struct Message has store, drop, copy {
        sender: address,
        content: String,
        timestamp: u64,
    }

    struct Payment has store, drop, copy {
        sender: address,
        amount: u64,
        note: String,
        timestamp: u64,
    }

    struct PaymentRequest has store, drop, copy {
        requester: address,
        amount: u64,
        note: String,
        timestamp: u64,
    }

    #[event]
    struct UserCreatedEvent has drop, store {
        user_address: address,
        user_name: String,
    }

    #[event]
    struct FriendAddedEvent has drop, store {
        user_address: address,
        friend_address: address,
    }

    #[event]
    struct PaymentSentEvent has drop, store {
        sender: address,
        recipient: address,
        amount: u64,
    }

    #[event]
    struct MessageSentEvent has drop, store {
        sender: address,
        recipient: address,
    }

    #[event]
    struct PaymentRequestedEvent has drop, store {
        requester: address,
        requestee: address,
        amount: u64,
    }

    const E_USER_ALREADY_EXISTS: u64 = 1;
    const E_USER_NOT_FOUND: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_SELF_OPERATION_NOT_ALLOWED: u64 = 4;
    const E_NOT_FRIEND: u64 = 5;
    const E_INVALID_AMOUNT: u64 = 6;

    fun init_module(account: &signer) {
        move_to(account, AllUsers { users: vector::empty() });
    }

    public entry fun create_id(account: &signer, user_name: String) acquires AllUsers, UserProfile {
        let signer_address = signer::address_of(account);
        assert!(!exists<UserProfile>(signer_address), E_USER_ALREADY_EXISTS);

        let user_profile = UserProfile {
            user_name,
            friends: vector::empty(),
            conversations: table::new(),
            sent_payment_requests: table::new(),
            received_payment_requests: table::new(),
            requestees: vector::empty(), // Initialize empty vector
            requesters: vector::empty(), // Initialize empty vector
            user_created_events: account::new_event_handle<UserCreatedEvent>(account),
            friend_added_events: account::new_event_handle<FriendAddedEvent>(account),
            payment_sent_events: account::new_event_handle<PaymentSentEvent>(account),
            message_sent_events: account::new_event_handle<MessageSentEvent>(account),
            payment_requested_events: account::new_event_handle<PaymentRequestedEvent>(account),
        };

        move_to(account, user_profile);

        let all_users = borrow_global_mut<AllUsers>(@0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435);
        vector::push_back(&mut all_users.users, UserInfo { address: signer_address, user_name });

        event::emit_event(&mut borrow_global_mut<UserProfile>(signer_address).user_created_events, 
        UserCreatedEvent { user_address: signer_address, user_name });
    }
    
    public entry fun add_friend(account: &signer, friend_address: address) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(friend_address), E_USER_NOT_FOUND);
        assert!(signer_address != friend_address, E_SELF_OPERATION_NOT_ALLOWED);

        let user_profile = borrow_global_mut<UserProfile>(signer_address);
        if (!vector::contains(&user_profile.friends, &friend_address)) {
            vector::push_back(&mut user_profile.friends, friend_address);
            table::add(&mut user_profile.conversations, friend_address, Conversation {
                messages: vector::empty(),
                payments: vector::empty(),
                payment_requests: vector::empty()
            });

            event::emit_event(&mut user_profile.friend_added_events, FriendAddedEvent { user_address: signer_address, friend_address });
        }
    }

    public entry fun send_payment(
        account: &signer,
        recipient: address,
        amount: u64,
        note: String
    ) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(recipient), E_USER_NOT_FOUND);
        assert!(signer_address != recipient, E_SELF_OPERATION_NOT_ALLOWED);

        {
            let sender_profile = borrow_global_mut<UserProfile>(signer_address);

            if (!table::contains(&sender_profile.conversations, recipient)) {
                table::add(&mut sender_profile.conversations, recipient, Conversation {
                    messages: vector::empty(),
                    payments: vector::empty(),
                    payment_requests: vector::empty()
                });
            };

            let coins = coin::withdraw<AptosCoin>(account, amount);
            coin::deposit(recipient, coins);

            let payment = Payment {
                sender: signer_address,
                amount,
                note,
                timestamp: timestamp::now_seconds(),
            };

            let sender_conversation = table::borrow_mut(&mut sender_profile.conversations, recipient);
            vector::push_back(&mut sender_conversation.payments, payment);

            event::emit_event(&mut sender_profile.payment_sent_events, PaymentSentEvent { 
                sender: signer_address, 
                recipient, 
                amount 
            });
        };

        {
            let recipient_profile = borrow_global_mut<UserProfile>(recipient);
            if (!table::contains(&recipient_profile.conversations, signer_address)) {
                table::add(&mut recipient_profile.conversations, signer_address, Conversation {
                    messages: vector::empty(),
                    payments: vector::empty(),
                    payment_requests: vector::empty()
                });
            };
            let recipient_conversation = table::borrow_mut(&mut recipient_profile.conversations, signer_address);
            let payment = Payment {
                sender: signer_address,
                amount,
                note,
                timestamp: timestamp::now_seconds(),
            };
            vector::push_back(&mut recipient_conversation.payments, payment);
        };
    }

    public entry fun send_message(account: &signer, recipient: address, content: String) acquires UserProfile {
        let signer_address = signer::address_of(account);
        assert!(exists<UserProfile>(signer_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(recipient), E_USER_NOT_FOUND);

        let sender_profile = borrow_global_mut<UserProfile>(signer_address);
        // assert!(vector::contains(&sender_profile.friends, &recipient), E_NOT_FRIEND);

        let message = Message {
            sender: signer_address,
            content,
            timestamp: timestamp::now_seconds(),
        };

        let sender_conversation = table::borrow_mut(&mut sender_profile.conversations, recipient);
        vector::push_back(&mut sender_conversation.messages, message);

        event::emit_event(&mut sender_profile.message_sent_events, MessageSentEvent { sender: signer_address, recipient });

        // Add message to recipient's conversation
        let recipient_profile = borrow_global_mut<UserProfile>(recipient);
        let recipient_conversation = table::borrow_mut(&mut recipient_profile.conversations, signer_address);
        vector::push_back(&mut recipient_conversation.messages, message);
    }

    // Request a payment

    public entry fun request_payment(
        account: &signer,
        requestee: address,
        amount: u64,
        note: String
    ) acquires UserProfile {
        let requester_address = signer::address_of(account);
        assert!(exists<UserProfile>(requester_address), E_USER_NOT_FOUND);
        assert!(exists<UserProfile>(requestee), E_USER_NOT_FOUND);
        assert!(requester_address != requestee, E_SELF_OPERATION_NOT_ALLOWED);
        assert!(amount > 0, E_INVALID_AMOUNT);

        let payment_request = PaymentRequest {
            requester: requester_address,
            amount,
            note,
            timestamp: timestamp::now_seconds(),
        };

        // Update requester's profile
        {
            let requester_profile = borrow_global_mut<UserProfile>(requester_address);
            if (!table::contains(&requester_profile.sent_payment_requests, requestee)) {
                table::add(&mut requester_profile.sent_payment_requests, requestee, vector::empty());
                vector::push_back(&mut requester_profile.requestees, requestee); // Add requestee to tracking vector
            };
            let sent_requests = table::borrow_mut(&mut requester_profile.sent_payment_requests, requestee);
            vector::push_back(sent_requests, payment_request);

            // Add to conversation
            if (!table::contains(&requester_profile.conversations, requestee)) {
                table::add(&mut requester_profile.conversations, requestee, Conversation {
                    messages: vector::empty(),
                    payments: vector::empty(),
                    payment_requests: vector::empty(),
                });
            };
            let conversation = table::borrow_mut(&mut requester_profile.conversations, requestee);
            vector::push_back(&mut conversation.payment_requests, payment_request);

            event::emit_event(&mut requester_profile.payment_requested_events, PaymentRequestedEvent { 
                requester: requester_address, 
                requestee, 
                amount 
            });
        };

        // Update requestee's profile
        {
            let requestee_profile = borrow_global_mut<UserProfile>(requestee);
            if (!table::contains(&requestee_profile.received_payment_requests, requester_address)) {
                table::add(&mut requestee_profile.received_payment_requests, requester_address, vector::empty());
                vector::push_back(&mut requestee_profile.requesters, requester_address); // Add requester to tracking vector
            };
            let received_requests = table::borrow_mut(&mut requestee_profile.received_payment_requests, requester_address);
            vector::push_back(received_requests, payment_request);

            // Add to conversation
            if (!table::contains(&requestee_profile.conversations, requester_address)) {
                table::add(&mut requestee_profile.conversations, requester_address, Conversation {
                    messages: vector::empty(),
                    payments: vector::empty(),
                    payment_requests: vector::empty(),
                });
            };
            let conversation = table::borrow_mut(&mut requestee_profile.conversations, requester_address);
            vector::push_back(&mut conversation.payment_requests, payment_request);
        };
    }

    // View functions
    #[view]
    public fun get_username(account_address: address): String acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        user_profile.user_name
    }

    #[view] 
    public fun get_all_users(): vector<UserInfo> acquires AllUsers {
        borrow_global<AllUsers>(@0xcaf7360a4b144d245346c57a61f0681c417090ad93d65e8314c559b06bd2c435).users
    }

    #[view]
    public fun get_friends(account_address: address): vector<address> acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        user_profile.friends
    }

    #[view]
    public fun get_conversation(account_address: address, friend_address: address): (vector<Message>, vector<Payment>) acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        // assert!(vector::contains(&user_profile.friends, &friend_address), E_NOT_FRIEND);

        let conversation = table::borrow(&user_profile.conversations, friend_address);
        (conversation.messages, conversation.payments)
    }

    #[view]
    public fun get_sent_payments(account_address: address, friend_address: address): vector<Payment> acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        
        if (table::contains(&user_profile.conversations, friend_address)) {
            let conversation = table::borrow(&user_profile.conversations, friend_address);
            conversation.payments
        } else {
            vector::empty<Payment>()
        }
    }

    // Get all sent payment requests
    #[view]
    public fun get_sent_payment_requests(account_address: address): vector<PaymentRequest> acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        
        let all_requests = vector::empty();
        let i = 0;
        let len = vector::length(&user_profile.requestees);
        while (i < len) {
            let requestee = *vector::borrow(&user_profile.requestees, i);
            let requests = table::borrow(&user_profile.sent_payment_requests, requestee);
            vector::append(&mut all_requests, *requests);
            i = i + 1;
        };
        all_requests
    }

    // Get all received payment requests
    #[view]
    public fun get_received_payment_requests(account_address: address): vector<PaymentRequest> acquires UserProfile {
        assert!(exists<UserProfile>(account_address), E_USER_NOT_FOUND);
        let user_profile = borrow_global<UserProfile>(account_address);
        
        let all_requests = vector::empty();
        let i = 0;
        let len = vector::length(&user_profile.requesters);
        while (i < len) {
            let requester = *vector::borrow(&user_profile.requesters, i);
            let requests = table::borrow(&user_profile.received_payment_requests, requester);
            vector::append(&mut all_requests, *requests);
            i = i + 1;
        };
        all_requests
    }


}