import 'package:lovmy/core/ui.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'chat_service.dart';

class ChatBubble extends StatelessWidget {
  final String message;
  final bool alingment;
  final Color chatColor;
  final Color textColor;
  const ChatBubble({super.key, required this.message, required this.alingment, required this.chatColor, required this.textColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.only(
            bottomLeft: Radius.circular(alingment ? 0 : 12),
            topLeft: const Radius.circular(12),
            topRight: const Radius.circular(12),
            bottomRight: Radius.circular(alingment ? 12 : 0)),
        color: chatColor,
      ),
      child: Text(
        message,
        style: TextStyle(

            fontSize: 16,
            color: textColor,
           ),
      ),
    );
  }
}


class MessageBubble extends StatefulWidget {
  const MessageBubble({
    super.key,
    required this.isMe,
    required this.message,
  });

  final bool isMe;
  final Message message;

  @override
  State<MessageBubble> createState() => _MessageBubbleState();
}

class _MessageBubbleState extends State<MessageBubble> with SingleTickerProviderStateMixin {
  late final AnimationController _entranceController;

  @override
  void initState() {
    super.initState();
    _entranceController = AnimationController(vsync: this, duration: const Duration(milliseconds: 260));
    _entranceController.forward();
  }

  @override
  void dispose() {
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final curved = CurvedAnimation(parent: _entranceController, curve: Curves.easeOut);
    return Align(
      alignment:
      widget.isMe ? Alignment.topLeft : Alignment.topRight,
      child: FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(begin: const Offset(0, 0.15), end: Offset.zero).animate(curved),
          child: ConstrainedBox(
            constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
            child: Container(
        decoration: BoxDecoration(
          color: widget.isMe ? Colors.grey.shade100 : AppColors.appColor,
          gradient: widget.isMe ? null : AppColors.gradientPrimary,
          // border: Border.all(color: widget.isMe ? notifier.border : Colors.transparent),
          borderRadius: widget.isMe
              ? const BorderRadius.only(
            topRight: Radius.circular(20),
            bottomRight: Radius.circular(20),
            topLeft: Radius.circular(20),
          )
              : const BorderRadius.only(
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(20),
            topLeft: Radius.circular(20),
          ),
          boxShadow: widget.isMe ? null : [
            BoxShadow(
              color: AppColors.passionRed.withOpacity(0.25),
              blurRadius: 12,
              offset: const Offset(0, 5),
            ),
          ],
        ),
        margin: const EdgeInsets.only(
            top: 10, right: 10, left: 10),
        padding: const EdgeInsets.all(10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: widget.isMe
              ? CrossAxisAlignment.start
              : CrossAxisAlignment.end,
          children: [
            Text(
                widget.message.message,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: widget.isMe ? AppColors.black : AppColors.white)),
            const SizedBox(height: 5),
            Text(
                DateFormat('hh:mm a').format(DateTime.fromMicrosecondsSinceEpoch(widget.message.timestamp.microsecondsSinceEpoch)).toString(),
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                color: widget.isMe ? AppColors.black : AppColors.white,
              ),),
          ],
        ),
          ),
          ),
        ),
      ),
    );
  }
}

